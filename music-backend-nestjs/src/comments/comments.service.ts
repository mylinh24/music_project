import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { Song } from '../entities/song.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Song)
    private songRepository: Repository<Song>,
  ) {}

  async createComment(userId: number, body: { song_id: number; content: string; rating: number }) {
    const { song_id, content, rating } = body;

    // Kiểm tra user tồn tại
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User không tồn tại.');
    }

    // Kiểm tra song tồn tại
    const song = await this.songRepository.findOne({ where: { id: song_id } });
    if (!song) {
      throw new Error('Bài hát không tồn tại.');
    }

    // Kiểm tra quyền VIP cho bài hát exclusive
    if (song.exclusive && !user.vip) {
      throw new Error('Bạn không có quyền bình luận bài hát này. Vui lòng nâng cấp tài khoản VIP.');
    }

    // Kiểm tra rating hợp lệ
    if (rating < 1 || rating > 5) {
      throw new Error('Rating phải từ 1 đến 5.');
    }

    // Tạo comment
    const comment = this.commentRepository.create({
      user_id: userId,
      song_id,
      content,
      rating,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Trả về comment với thông tin user
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'song'],
    });
  }

  async getCommentsBySong(songId: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { song_id: songId },
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

  async updateComment(id: number, userId: number, body: { content?: string; rating?: number }) {
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

  async deleteComment(id: number, userId: number) {
    const comment = await this.commentRepository.findOne({ where: { id, user_id: userId } });
    if (!comment) {
      throw new Error('Bình luận không tồn tại hoặc bạn không có quyền xóa.');
    }

    await this.commentRepository.delete(id);
    return { message: 'Xóa bình luận thành công!' };
  }
}
