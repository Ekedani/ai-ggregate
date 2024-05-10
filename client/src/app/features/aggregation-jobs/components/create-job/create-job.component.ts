import {Component} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {JobService} from "../../aggregation-jobs.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-create-job',
  standalone: true,
  imports: [
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    NgForOf,
    MatButton,
    MatLabel
  ],
  templateUrl: './create-job.component.html',
  styleUrl: './create-job.component.css'
})
export class CreateJobComponent {
  selectedProviders: any;
  providers = ['midjourney', 'lexica', 'prompthero', 'civitai'];

  constructor(
    private jobService: JobService,
    private toastrService: ToastrService,
  ) {
  }


  submitForm() {
    this.jobService.createJob(this.selectedProviders).subscribe({
      next: () => {
        this.toastrService.success('Job created successfully');
      },
      error: (error) => {
        this.toastrService.error(error.data, 'Failed to create job');
      }
    });
  }
}
