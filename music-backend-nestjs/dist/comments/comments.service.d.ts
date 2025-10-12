import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../entities/user.entity';
import { Song } from '../entities/song.entity';
export declare class CommentsService {
    private commentRepository;
    private userRepository;
    private songRepository;
    constructor(commentRepository: Repository<Comment>, userRepository: Repository<User>, songRepository: Repository<Song>);
    createComment(userId: number, body: {
        song_id: number;
        content: string;
        rating: number;
    }): Promise<Comment | null>;
    getCommentsBySong(songId: number, page?: number, limit?: number): Promise<{
        comments: Comment[];
        pagination: {
            current_page: number;
            total_pages: number;
            total_comments: number;
        };
    }>;
    updateComment(id: number, userId: number, body: {
        content?: string;
        rating?: number;
    }): Promise<Comment | null>;
    deleteComment(id: number, userId: number): Promise<{
        message: string;
    }>;
}
