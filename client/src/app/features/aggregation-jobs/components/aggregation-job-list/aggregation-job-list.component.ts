import {Component, OnInit} from '@angular/core';
import {NgxPaginationModule} from "ngx-pagination";
import {
  MatCard,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {DatePipe, NgClass, NgForOf} from "@angular/common";
import {AggregationJob} from "../../interfaces/aggregation-job";
import {JobService} from "../../aggregation-jobs.service";
import {ToastrService} from "ngx-toastr";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";

@Component({
  selector: 'app-aggregation-job-list',
  standalone: true,
  imports: [
    NgxPaginationModule,
    MatCard,
    NgForOf,
    MatCardHeader,
    MatCardContent,
    MatCardTitle,
    MatCardFooter,
    MatIcon,
    MatTooltip,
    NgClass,
    MatCardSubtitle,
    DatePipe
  ],
  templateUrl: './aggregation-job-list.component.html',
  styleUrl: './aggregation-job-list.component.css'
})
export class AggregationJobListComponent implements OnInit {
  jobs: AggregationJob[] = [];
  p: number = 1;

  constructor(
    private jobService: JobService,
    private toastrService: ToastrService
  ) {
  }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobService.getJobs(this.p).subscribe({
      next: (response) => this.jobs = response.jobs,
      error: (error) => this.toastrService.error(error.data, 'Failed to load jobs')
    });
  }

  isSuccess(job: AggregationJob): boolean {
    return job.dataSourceDetails.some(detail => detail.status === 'success');
  }

  isFailure(job: AggregationJob): boolean {
    return job.dataSourceDetails.every(detail => detail.status === 'failed');
  }

  getContentTypeIcon(contentType: 'image' | 'text'): string {
    return contentType === 'image' ? 'image' : 'text_snippet';
  }

  getStatusIcon(status: 'running' | 'success' | 'failed'): string {
    switch (status) {
      case 'running':
        return 'sync';
      case 'success':
        return 'check_circle';
      case 'failed':
        return 'error';
      default:
        return 'help_outline';
    }
  }
}
