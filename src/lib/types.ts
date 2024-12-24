export interface Comic {
  id: string;
  title: string;
  series?: string;
  volume?: number;
  author: string;
  year?: number;
  coverUrl: string;
  description?: string;
}

export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail: string;
    };
  };
}