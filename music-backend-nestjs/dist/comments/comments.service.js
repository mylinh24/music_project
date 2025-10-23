"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const comment_entity_1 = require("../entities/comment.entity");
const user_entity_1 = require("../entities/user.entity");
const song_entity_1 = require("../entities/song.entity");
let CommentsService = class CommentsService {
    commentRepository;
    userRepository;
    songRepository;
    constructor(commentRepository, userRepository, songRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.songRepository = songRepository;
    }
    async createComment(userId, body) {
        const { song_id, content, rating } = body;
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User không tồn tại.');
        }
        const song = await this.songRepository.findOne({ where: { id: song_id } });
        if (!song) {
            throw new Error('Bài hát không tồn tại.');
        }
        if (song.exclusive && !user.vip) {
            throw new Error('Bạn không có quyền bình luận bài hát này. Vui lòng nâng cấp tài khoản VIP.');
        }
        if (rating < 1 || rating > 5) {
            throw new Error('Rating phải từ 1 đến 5.');
        }
        const comment = this.commentRepository.create({
            user_id: userId,
            song_id,
            content,
            rating,
            status: 'approved',
        });
        const savedComment = await this.commentRepository.save(comment);
        return this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: ['user', 'song'],
        });
    }
    async getCommentsBySong(songId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [comments, total] = await this.commentRepository.findAndCount({
            where: { song_id: songId, status: 'approved' },
            relations: ['user'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return {
            comments,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_comments: total,
            },
        };
    }
    async updateComment(id, userId, body) {
        const comment = await this.commentRepository.findOne({ where: { id, user_id: userId } });
        if (!comment) {
            throw new Error('Bình luận không tồn tại hoặc bạn không có quyền chỉnh sửa.');
        }
        if (body.rating && (body.rating < 1 || body.rating > 5)) {
            throw new Error('Rating phải từ 1 đến 5.');
        }
        await this.commentRepository.update(id, body);
        return this.commentRepository.findOne({
            where: { id },
            relations: ['user'],
        });
    }
    async deleteComment(id, userId) {
        const comment = await this.commentRepository.findOne({ where: { id, user_id: userId } });
        if (!comment) {
            throw new Error('Bình luận không tồn tại hoặc bạn không có quyền xóa.');
        }
        await this.commentRepository.delete(id);
        return { message: 'Xóa bình luận thành công!' };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(comment_entity_1.Comment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(song_entity_1.Song)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CommentsService);
//# sourceMappingURL=comments.service.js.map