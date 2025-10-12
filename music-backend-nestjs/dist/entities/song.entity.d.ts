import { Artist } from './artist.entity';
import { Category } from './category.entity';
export declare class Song {
    id: number;
    title: string;
    artist_id: number;
    category_id: number;
    release_date: Date;
    listenCount: number;
    image_url: string;
    audio_url: string;
    lyrics: string;
    exclusive: boolean;
    artist: Artist;
    category: Category;
}
