# Frontend Skeleton - Dr. Bushra's Dental Care Blog

## 🏗️ Project Overview

**Framework**: Next.js 15.5.4 with App Router  
**Language**: TypeScript  
**Styling**: Tailwind CSS v4 (CSS-First approach)  
**CMS**: Sanity CMS integration  
**Deployment**: Standalone output configuration  

---

## 📁 Project Structure

```
frontend/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── next.config.mjs           # Next.js configuration
│   ├── tailwind.config.js        # Tailwind CSS setup
│   ├── tsconfig.json             # TypeScript configuration
│   ├── eslint.config.mjs         # ESLint configuration
│   ├── postcss.config.mjs        # PostCSS configuration
│   ├── sanity.config.ts          # Sanity Studio configuration
│   └── sanity.cli.ts             # Sanity CLI configuration
│
├── 📁 public/                    # Static assets
│   ├── Images/                   # Dental care images & logos
│   │   ├── Braces.jpg
│   │   ├── DentalImplants.avif
│   │   ├── dr-bushra.jpg
│   │   ├── TheLogo.jpeg
│   │   └── ... (20+ dental images)
│   └── *.svg                     # Next.js default icons
│
└── 📁 src/                       # Source code
    ├── 📁 app/                   # Next.js App Router
    │   ├── layout.tsx            # Root layout with fonts & global components
    │   ├── page.tsx              # Homepage
    │   ├── globals.css           # Global styles with Tailwind v4
    │   ├── about/page.tsx        # About page
    │   ├── blogs/                # Blog section
    │   │   ├── page.tsx          # Blog listing with search/filter
    │   │   └── [id]/page.tsx     # Individual blog post
    │   ├── contact/              # Contact section
    │   │   ├── page.tsx          # Contact form
    │   │   └── actions.ts        # Server actions for form handling
    │   └── Studio/[[...tool]]/   # Sanity Studio integration
    │       └── page.tsx
    │
    ├── 📁 components/            # Reusable UI components
    │   ├── Header.tsx            # Navigation header
    │   ├── Footer.tsx            # Site footer
    │   ├── BlogCard.tsx          # Blog post card component
    │   └── Home/
    │       └── Hero.tsx          # Homepage hero section
    │
    ├── 📁 data/                  # Static data & types
    │   └── posts.ts              # Mock blog posts & Post type definition
    │
    ├── 📁 page/                  # Page-specific components
    │   └── Home.tsx              # Homepage component
    │
    ├── 📁 sanity/                # Sanity CMS integration
    │   ├── env.ts                # Environment configuration
    │   ├── lib/                  # Sanity utilities
    │   │   ├── client.ts         # Sanity client setup
    │   │   ├── image.ts          # Image URL builder
    │   │   ├── live.ts           # Live preview setup
    │   │   └── queries.ts        # GROQ queries
    │   ├── schemaTypes/          # Content schemas
    │   │   ├── index.ts          # Schema exports
    │   │   ├── postType.ts       # Blog post schema
    │   │   ├── authorType.ts     # Author schema
    │   │   ├── categoryType.ts   # Category schema
    │   │   └── blockContentType.ts # Rich text schema
    │   └── structure.ts          # Studio structure
    │
    └── 📁 schemas/               # Additional type definitions
        └── post.ts               # Post-related schemas
```

---

## 🎨 Styling & Design System

### **Tailwind CSS v4 Configuration**
- **CSS-First Approach**: Using `@theme` directive in globals.css
- **Custom Color Palette**:
  ```css
  --color-primary: #1f5855        /* Teal primary */
  --color-tealSoft: #7aa9ac       /* Soft teal */
  --color-neutralLight: #bfc7c7   /* Light neutral */
  --color-brownAccent: #5a4319    /* Brown accent */
  --color-goldAccent: #e7cb76     /* Gold accent */
  ```

### **Typography**
- **Heading Font**: Playfair Display (Google Fonts)
- **Body Font**: Inter (Google Fonts)
- **Font Variables**: CSS custom properties for consistent usage

### **Custom Animations**
- **Slide Animation**: `slideLeftFast` keyframe for smooth scrolling effects
- **Duration**: 10s linear infinite for continuous movement

---

## 🧩 Component Architecture

### **Layout Components**
- **`Header.tsx`**: Navigation with logo, responsive menu
- **`Footer.tsx`**: Simple copyright footer
- **`layout.tsx`**: Root layout with font loading and global structure

### **Content Components**
- **`BlogCard.tsx`**: Reusable blog post preview card
- **`Hero.tsx`**: Homepage hero section (minimal implementation)

### **Page Components**
- **Homepage**: Hero + Recent articles + Highlights sections
- **Blog Listing**: Search, filter, pagination functionality
- **Blog Detail**: Individual post display
- **About**: Static content about the practice
- **Contact**: Form with server actions

---

## 🗄️ Data Management

### **Static Data (Current)**
- **`posts.ts`**: Mock blog posts with TypeScript types
- **Post Type**: `{ id, title, excerpt, category, date, image?, tags?, content }`
- **Categories**: Dental Care, Cosmetic Dentistry, Pediatric Dentistry, Oral Surgery

### **Sanity CMS Integration (Configured)**
- **Content Types**:
  - **Post**: Title, slug, author, mainImage, categories, publishedAt, body
  - **Author**: Name, slug, image, bio
  - **Category**: Title, description
  - **Block Content**: Rich text with formatting options

---

## 🚀 Routing Structure

### **App Router Pages**
```
/ (Homepage)
├── /about (About page)
├── /blogs (Blog listing)
│   └── /blogs/[id] (Individual blog post)
├── /contact (Contact form)
└── /Studio/[[...tool]] (Sanity Studio)
```

### **API Routes**
- **Contact Form**: Server actions in `contact/actions.ts`
- **Sanity Integration**: Client-side data fetching

---

## 🔧 Development Features

### **Performance Optimizations**
- **Turbopack**: Enabled for development (`--turbopack` flag)
- **Image Optimization**: Next.js Image component with unoptimized setting
- **Standalone Output**: Configured for deployment

### **Developer Experience**
- **TypeScript**: Full type safety across components
- **ESLint**: Code quality and consistency
- **Hot Reload**: Fast development with Turbopack

---

## 🎯 Key Features

### **Blog Functionality**
- ✅ **Blog Listing**: Search, filter by category, sort options
- ✅ **Pagination**: 6 posts per page
- ✅ **Individual Posts**: Dynamic routing with [id]
- ✅ **Categories**: Dental care topics organization

### **Content Management**
- ✅ **Sanity Studio**: Integrated at `/Studio` route
- ✅ **Rich Text**: Block content with formatting
- ✅ **Image Handling**: Optimized image uploads and display
- ✅ **Author Management**: Author profiles and attribution

### **User Experience**
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Fast Loading**: Optimized images and code splitting
- ✅ **SEO Ready**: Meta tags and structured data
- ✅ **Contact Form**: Server-side form handling

---

## 🔗 Integration Points

### **External Services**
- **Sanity CMS**: Content management and storage
- **Google Fonts**: Typography (Playfair Display, Inter)
- **Next.js**: Framework and deployment platform

### **Environment Variables**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

---

## 📦 Dependencies Overview

### **Core Framework**
- `next@15.5.4` - React framework
- `react@19.1.0` - UI library
- `typescript@5` - Type safety

### **Styling**
- `tailwindcss@4` - Utility-first CSS
- `framer-motion@12.23.24` - Animations
- `styled-components@6.1.19` - CSS-in-JS

### **CMS & Content**
- `sanity@4.10.3` - Headless CMS
- `next-sanity@11.5.5` - Next.js integration
- `react-markdown@10.1.0` - Markdown rendering

### **UI Components**
- `lucide-react@0.544.0` - Icon library
- `react-slick@0.31.0` - Carousel component
- `yet-another-react-lightbox@3.25.0` - Image lightbox

---

## 🚀 Getting Started

### **Development Commands**
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Development URLs**
- **Frontend**: http://localhost:3000
- **Sanity Studio**: http://localhost:3000/Studio

---

## 🎨 Design Patterns

### **Component Structure**
- **Functional Components**: React hooks and modern patterns
- **TypeScript Props**: Strongly typed component interfaces
- **CSS Modules**: Tailwind classes with custom properties

### **State Management**
- **React Hooks**: useState, useFormState, useFormStatus
- **Client Components**: Marked with 'use client' directive
- **Server Actions**: Form handling with Next.js server actions

### **File Organization**
- **Feature-based**: Components grouped by functionality
- **Type Definitions**: Centralized in data/ and schemas/
- **Configuration**: Root-level config files

---

This frontend skeleton provides a solid foundation for a modern dental care blog with content management capabilities, responsive design, and excellent developer experience.