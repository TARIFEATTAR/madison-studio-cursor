# Image Categorization System

## Overview
Madison uses a **use case-based categorization system** aligned with industry best practices (Canva, Adobe Firefly, etc.). Images are categorized by **WHERE they'll be used**, not just by **HOW they look**.

## Primary Categories (Use Cases)

### 1. **E-commerce** 🛍️
- **Purpose**: Product listings for online stores
- **Use Cases**: Shopify, Etsy, Amazon, WooCommerce
- **Shot Types**:
  - Product on White
  - Reflective Surface (luxury products)

### 2. **Social Media** 📱
- **Purpose**: Content for social platforms
- **Use Cases**: Instagram, Facebook, TikTok, Pinterest
- **Shot Types**:
  - Lifestyle Scene
  - Natural Setting

### 3. **Editorial** 📰
- **Purpose**: Magazine, blog, press content
- **Use Cases**: Blog features, press releases, magazine spreads
- **Shot Types**:
  - Editorial Luxury

### 4. **Flat Lay** 📐
- **Purpose**: Overhead compositions
- **Use Cases**: Social media, e-commerce, Instagram
- **Shot Types**:
  - Flat Lay

### 5. **Lifestyle** ✨
- **Purpose**: Brand storytelling with people
- **Use Cases**: Brand campaigns, people in scenes
- **Shot Types**: (Future expansion)

### 6. **Creative & Artistic** 🎨
- **Purpose**: Artistic, conceptual, experimental
- **Use Cases**: Art projects, creative campaigns
- **Shot Types**: (Future expansion)

## Mapping Logic

**Before (Confusing):**
- "Product on White" → "Product Photography" ❌
- User creates for Shopify → Can't find under "E-commerce" ❌

**After (Clear):**
- "Product on White" → "E-commerce" ✅
- User creates for Shopify → Finds it under "E-commerce" ✅

## Key Principles

1. **User Intent First**: Categories match what users are trying to accomplish
2. **Industry Standard**: Aligns with how Canva, Adobe, and other tools categorize
3. **Future-Proof**: Easy to add new shot types without breaking categories
4. **Clear Mapping**: Each shot type maps to exactly one primary use case

## Technical Implementation

- **Shot Types** (`imageCategories`): The specific styles users choose in Image Studio
- **Broad Categories** (`BROAD_IMAGE_CATEGORIES`): The use case filters in the Library
- **Mapping**: Each shot type has a `broadCategory` that links to the use case

## Migration Notes

- Old "product" category → Now "ecommerce"
- All existing images with "product" category will need migration (or fallback handling)
- New images automatically use the correct mapping







































