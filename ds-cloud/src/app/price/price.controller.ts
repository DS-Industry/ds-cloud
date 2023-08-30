import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { PriceService } from './price.service';
import { UpdatePriceRequestDto } from '@/app/price/dto/req/update-price-request.dto';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RolesGuard } from '@/auth/guard/roles.guard';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Patch()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Body() body: UpdatePriceRequestDto) {
    return await this.priceService.update(body);
  }
}
