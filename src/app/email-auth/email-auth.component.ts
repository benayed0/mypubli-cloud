import { JsonPipe } from '@angular/common';
import { Component, inject, model, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-email-auth',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
  templateUrl: './email-auth.component.html',
  styleUrl: './email-auth.component.css',
})
export class EmailAuthComponent implements OnInit {
  passwordVisible = false;
  readonly data = inject<{ email: string }>(MAT_DIALOG_DATA);
  ngOnInit(): void {
    if (this.data?.email) {
      this.emailFormControl.setValue(this.data.email);
    }
  }
  readonly dialogRef = inject(MatDialogRef<EmailAuthComponent>);
  toastr = inject(HotToastService);
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);
  passwordFormControl = new FormControl('', [this.passwordValidator()]);
  onNoClick(): void {
    this.dialogRef.close();
  }
  onYesClick(): void {
    if (!this.emailFormControl.valid) {
      this.toastr.error('Email invalide');
      return;
    }
    if (!this.passwordFormControl.valid) {
      this.toastr.error('Mot de passe invalide');
      return;
    }

    this.dialogRef.close({
      email: this.emailFormControl.value,
      password: this.passwordFormControl.value,
    });
  }
  // Custom Validator Function
  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || ''; // Handle null/undefined values
      const errors: { [key: string]: boolean } = {};

      // Check each rule and add an error if it fails
      if (value.trim() === '') {
        errors['required'] = true;
      }
      if (value.length < 8) {
        errors['length'] = true;
      }
      if (!/[a-z]/.test(value)) {
        errors['lower'] = true;
      }
      if (!/[A-Z]/.test(value)) {
        errors['uppercase'] = true;
      }
      if (!/[!@#$%^&*()_+\[\]{}|;:',.<>?/~`\\\-]/.test(value)) {
        errors['special'] = true;
      }
      if (!/[0-9]/.test(value)) {
        errors['number'] = true;
      }

      // If there are no errors, return null; otherwise, return the errors object
      return Object.keys(errors).length ? errors : null;
    };
  }
}
