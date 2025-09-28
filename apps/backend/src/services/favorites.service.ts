import prisma from "../database/prisma";

export class FavoritesService {
  async getFavoriteComics(userId: string) {
    return prisma.user_favorite_comics.findMany({
      where: { user_id: userId },
      include: { comics: true },
    });
  }

  async addFavoriteComic(userId: string, comicId: string) {
    return prisma.user_favorite_comics.create({
      data: {
        user_id: userId,
        comic_id: comicId,
      },
    });
  }

  async removeFavoriteComic(userId: string, comicId: string) {
    return prisma.user_favorite_comics.delete({
      where: {
        user_id_comic_id: {
          user_id: userId,
          comic_id: comicId,
        },
      },
    });
  }
}

export const favoritesService = new FavoritesService();