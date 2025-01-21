import { Component, OnInit } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { Article, ArticlesComponent } from '../articles/articles.component';
import { ArticleService } from '../services/article/article.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileUploadComponent, ArticlesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  constructor(private articleService: ArticleService) {}
  addFiles(article: Article) {
    console.log(article);
    this.articles = [...this.articles, article];
  }
  articles: Article[] = [];
  async ngOnInit() {
    await this.articleService.checkUnfinishedArticle();

    this.getArticles();
  }
  getArticles() {
    this.articleService.getByUser().subscribe((articles) => {
      this.articles = articles;
    });
  }
}
