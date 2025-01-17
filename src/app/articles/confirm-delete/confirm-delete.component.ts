import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [],
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.css',
})
export class ConfirmDeleteComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { name: string },
    private dialogRef: MatDialogRef<ConfirmDeleteComponent>
  ) {}
  confirmDelete() {
    this.dialogRef.close(true);
  }
  close() {
    this.dialogRef.close(false);
  }
}
