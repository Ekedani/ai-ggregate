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
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {CreateJobComponent} from "../create-job/create-job.component";

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
    DatePipe,
    MatFormField,
    MatSelect,
    MatOption,
    MatLabel,
    FormsModule,
    CreateJobComponent
  ],
  templateUrl: './aggregation-job-list.component.html',
  styleUrl: './aggregation-job-list.component.css'
})
export class AggregationJobListComponent implements OnInit {
  jobs: AggregationJob[] = [];
  page: number = 1;
  total: number = 0;
  filterStatus?: string;

  constructor(
    private jobService: JobService,
    private toastrService: ToastrService
  ) {
  }

  ngOnInit() {
    this.loadJobs();
  }

  loadJobs() {
    this.jobService.getJobs(this.page, this.filterStatus).subscribe({
      next: (response) => {
        this.jobs = response.jobs
        this.total = response.total;
        if (response.total === 0) {
          this.page = 1;
          this.toastrService.info('No jobs found', 'No jobs');
        }
      },
      error: (error) => this.toastrService.error(error.data, 'Failed to load jobs')
    });
  }

  isSuccess(job: AggregationJob): boolean {
    return job.dataSourceDetails.some(detail => detail.status === 'success');
  }

  isFailure(job: AggregationJob): boolean {
    return job.dataSourceDetails.every(detail => detail.status === 'failed');
  }

  isRunning(job: AggregationJob): boolean {
    return job.status === 'running';
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

  changePage($event: number) {
    this.page = $event;
    this.loadJobs();
  }
}
