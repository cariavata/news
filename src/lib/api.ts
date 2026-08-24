import { Article, CategoryInfo, CompanyPage } from "../types";
import { fallbackArticles, fallbackCategories, fallbackCompanyPages } from "../data/fallbackData";

export async function uploadImagesApi(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
    const data = await res.json();
    return data.urls || [];
  } catch (error) {
    console.error("Image upload error:", error);
    // Fallback: Read as Data URL client-side if API fails
    const promises = files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(promises);
  }
}

export async function fetchArticlesApi(): Promise<Article[]> {
  try {
    const res = await fetch("/api/articles");
    if (!res.ok) throw new Error("Failed to fetch articles");
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch (error) {
    console.warn("REST API articles fetch failed:", error);
  }
  return [];
}

export async function createArticleApi(articleData: Partial<Article>): Promise<Article> {
  const res = await fetch("/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(articleData),
  });
  if (!res.ok) throw new Error("Failed to create article");
  return res.json();
}

export async function updateArticleApi(id: string, articleData: Partial<Article>): Promise<Article> {
  const res = await fetch(`/api/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(articleData),
  });
  if (!res.ok) throw new Error("Failed to update article");
  return res.json();
}

export async function deleteArticleApi(id: string): Promise<boolean> {
  const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
  return res.ok;
}

export async function incrementArticleViewsApi(id: string): Promise<void> {
  try {
    await fetch(`/api/articles/${id}/views`, { method: "POST" });
  } catch (e) {
    // Ignore views increment failure
  }
}

export async function fetchCategoriesApi(): Promise<CategoryInfo[]> {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (error) {
    console.warn("REST API categories fetch failed:", error);
  }
  return fallbackCategories;
}

export async function fetchCompanyPagesApi(): Promise<CompanyPage[]> {
  try {
    const res = await fetch("/api/company-pages");
    if (!res.ok) throw new Error("Failed to fetch company pages");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (error) {
    console.warn("REST API company pages fetch failed:", error);
  }
  return fallbackCompanyPages;
}

export async function saveSeoSettingsApi(seoData: any): Promise<void> {
  await fetch("/api/seo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(seoData),
  });
}

export async function fetchSeoSettingsApi(): Promise<any> {
  try {
    const res = await fetch("/api/seo");
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Fetch SEO settings failed:", e);
  }
  return null;
}
