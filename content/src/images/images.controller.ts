import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { GetImagesDto } from './dto/get-images.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ValidateMongoIdPipe } from '../shared/pipes/validate-mongo-id.pipe';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Req() req: any,
    @Body() createImageDto: CreateImageDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.imagesService.saveImage(createImageDto, image, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() getImagesDto: GetImagesDto) {
    return this.imagesService.findImages(getImagesDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ValidateMongoIdPipe) id: string) {
    return this.imagesService.findImageById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.imagesService.deleteImage(id);
  }
}
