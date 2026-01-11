# Simple Blog

A basic blog with posts and comments demonstrating component composition.

## Features

- Display blog posts with metadata
- Toggle comments visibility
- Add new comments
- Nested component structure
- Scoped styling

---

## Complete Code

```javascript
import Eleva from "eleva";

const app = new Eleva("BlogApp");

// Comment Component
app.component("Comment", {
  setup({ props }) {
    return { comment: props.comment };
  },
  template: (ctx) => `
    <div class="comment">
      <div class="comment-header">
        <strong>${ctx.comment.author}</strong>
        <span class="date">${ctx.comment.date}</span>
      </div>
      <p>${ctx.comment.text}</p>
    </div>
  `
});

// Post Component
app.component("BlogPost", {
  setup({ signal, props }) {
    const post = props.post;
    const showComments = signal(false);
    const newComment = signal("");
    const comments = signal(post.comments || []);

    function toggleComments() {
      showComments.value = !showComments.value;
    }

    function addComment() {
      if (!newComment.value.trim()) return;

      comments.value = [...comments.value, {
        id: Date.now(),
        author: "Anonymous",
        text: newComment.value,
        date: new Date().toLocaleDateString()
      }];
      newComment.value = "";
    }

    return { post, showComments, newComment, comments, toggleComments, addComment };
  },
  template: (ctx) => `
    <article class="blog-post">
      <header>
        <h2>${ctx.post.title}</h2>
        <div class="post-meta">
          <span>By ${ctx.post.author}</span>
          <span>${ctx.post.date}</span>
          <span>${ctx.post.readTime} min read</span>
        </div>
      </header>

      <div class="post-content">
        <p>${ctx.post.excerpt}</p>
      </div>

      <footer>
        <button @click="toggleComments">
          ${ctx.showComments.value ? 'Hide' : 'Show'} Comments (${ctx.comments.value.length})
        </button>
      </footer>

      ${ctx.showComments.value ? `
        <div class="comments-section">
          ${ctx.comments.value.map(comment => `
            <div key="${comment.id}" class="comment-wrapper" :comment="comment"></div>
          `).join('')}

          <div class="add-comment">
            <textarea
              placeholder="Write a comment..."
              @input="(e) => newComment.value = e.target.value"
            >${ctx.newComment.value}</textarea>
            <button @click="addComment">Post Comment</button>
          </div>
        </div>
      ` : ''}
    </article>
  `,
  children: {
    ".comment-wrapper": "Comment"
  }
});

// Main Blog Component
app.component("Blog", {
  setup({ signal }) {
    const posts = signal([
      {
        id: 1,
        title: "Getting Started with Eleva",
        author: "John Doe",
        date: "January 3, 2026",
        readTime: 5,
        excerpt: "Learn the basics of Eleva, a minimalist JavaScript framework that emphasizes simplicity and performance. In this guide, we'll cover components, signals, and the template system.",
        comments: [
          { id: 1, author: "Jane", text: "Great introduction!", date: "January 3, 2026" }
        ]
      },
      {
        id: 2,
        title: "Building Reactive UIs",
        author: "Jane Smith",
        date: "January 2, 2026",
        readTime: 8,
        excerpt: "Dive deep into Eleva's signal-based reactivity system. Understand how signals work under the hood and how to use them effectively in your applications.",
        comments: []
      },
      {
        id: 3,
        title: "Plugin Development Guide",
        author: "John Doe",
        date: "January 1, 2026",
        readTime: 10,
        excerpt: "Learn how to extend Eleva with custom plugins. We'll build a complete plugin from scratch, covering the plugin lifecycle and best practices.",
        comments: [
          { id: 1, author: "Dev", text: "Very helpful!", date: "January 1, 2026" },
          { id: 2, author: "Alex", text: "Can you cover testing?", date: "January 2, 2026" }
        ]
      }
    ]);

    return { posts };
  },
  template: (ctx) => `
    <div class="blog">
      <header class="blog-header">
        <h1>Eleva Blog</h1>
        <p>Tutorials, guides, and best practices</p>
      </header>

      <div class="posts">
        ${ctx.posts.value.map(post => `
          <div key="${post.id}" class="post-wrapper" :post="post"></div>
        `).join('')}
      </div>
    </div>
  `,
  style: `
    .blog { max-width: 800px; margin: 0 auto; padding: 20px; }
    .blog-header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
    .blog-header h1 { margin: 0 0 10px 0; }
    .blog-header p { color: #666; margin: 0; }
    .blog-post { background: white; border: 1px solid #eee; border-radius: 8px; padding: 25px; margin-bottom: 20px; }
    .blog-post h2 { margin: 0 0 10px 0; }
    .post-meta { display: flex; gap: 15px; color: #666; font-size: 14px; margin-bottom: 15px; }
    .post-content { color: #444; line-height: 1.6; }
    .blog-post footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
    .blog-post footer button { background: none; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .comments-section { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
    .comment { background: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 10px; }
    .comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .comment-header .date { color: #999; font-size: 12px; }
    .comment p { margin: 0; }
    .add-comment textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 80px; margin-bottom: 10px; }
    .add-comment button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
  `,
  children: {
    ".post-wrapper": "BlogPost"
  }
});

app.mount(document.getElementById("app"), "Blog");
```

---

## Component Structure

```
Blog (parent)
├── BlogPost (child, multiple)
│   └── Comment (grandchild, multiple)
```

This demonstrates Eleva's component composition:
- `Blog` manages the list of posts
- `BlogPost` handles individual post display and comments
- `Comment` renders a single comment

---

## Features Demonstrated

- **Component composition** - Three-level nesting
- **Props passing** - Data flow between components
- **Local component state** - Each post manages its own comments
- **Conditional rendering** - Toggle comments visibility
- **List rendering** - Map over posts and comments
- **Event handling** - Add comments, toggle sections
- **Scoped styling** - Component-specific CSS

---

[← Back to Apps](./index.md) | [Previous: Weather Dashboard](./weather-dashboard.md) | [Next: Custom Plugin Guide →](../custom-plugin.md)
