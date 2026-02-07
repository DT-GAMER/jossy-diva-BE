export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const PaginationUtil = {
  normalize(params: PaginationParams) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset,
    };
  },

  meta(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },
};
