import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('id') userId: string,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewsService.create(userId, createReviewDto);
  }

  @Public()
  @Get('product/:productId')
  findProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.findProductReviews(productId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, userId, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.reviewsService.remove(id, userId, role);
  }
}
