import { User } from './user.entity';
import { Song } from './song.entity';
export declare class ListenHistory {
    id: number;
    user_id: number;
    song_id: number;
    listenedAt: Date;
    user: User;
    song: Song;
}
