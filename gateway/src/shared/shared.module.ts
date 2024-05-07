import { Global, Module } from '@nestjs/common';
import { ProxyService } from './services/proxy.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  providers: [ProxyService],
  imports: [HttpModule],
  exports: [ProxyService],
})
export class SharedModule {}
