import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string; // e.g. "Suppression de l'article :"
  message: string; // e.g. "Êtes-vous sûr de vouloir supprimer cet article ?"
  itemName?: string; // e.g. If you want to pass the file name "article.pdf"
  confirmLabel?: string; // e.g. "Supprimer"
  cancelLabel?: string; // e.g. "Annuler"
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css',
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}
  confirm() {
    this.dialogRef.close(true);
  }
  cancel() {
    this.dialogRef.close(false);
  }
}
