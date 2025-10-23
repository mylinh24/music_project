import { User } from './user.entity';
import { Song } from './song.entity';
export declare class Comment {
    id: number;
    user_id: number;
    song_id: number;
    content: string;
    rating: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
    user: User;
    song: Song;
}
