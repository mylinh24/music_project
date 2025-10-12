import { Song } from './song.entity';
export declare class Comment {
    id: number;
    user_id: number;
    song_id: number;
    content: string;
    rating: number;
    createdAt: Date;
    updatedAt: Date;
    song: Song;
}
