# Sanity Canvas Integration with Madison Studio

## 🎨 Overview

Sanity Canvas is a visual content editing interface that allows for rich, structured content creation. This integration enables bidirectional sync between Madison Studio and Sanity Canvas documents.

---

## 🔄 Integration Approaches

### **Approach 1: Pull Canvas Content into Madison**

**Use Case:** Import existing Canvas documents into Madison for AI enhancement, repurposing, or editing.

**Flow:**
1. User selects a Canvas document
2. Content is fetched from Sanity
3. Converted to Madison format (Portable Text → Markdown/Rich Text)
4. Loaded into Madison editor
5. User can edit, enhance with AI, or repurpose

**Benefits:**
- Use Madison AI to enhance existing Canvas content
- Repurpose Canvas content for different channels
- Leverage Madison's editorial tools on Canvas content

---

### **Approach 2: Push Madison Content to Canvas**

**Use Case:** Export Madison-generated content to Canvas for visual editing and design.

**Flow:**
1. User creates/edits content in Madison
2. Clicks "Push to Canvas"
3. Content converted to Canvas format
4. New Canvas document created in Sanity
5. User can open in Canvas for visual editing

**Benefits:**
- Combine Madison's AI writing with Canvas visual editing
- Create rich, designed content pieces
- Maintain content in both systems

---

### **Approach 3: Canvas as Content Source for Madison**

**Use Case:** Use Canvas documents as source material for Madison content generation.

**Flow:**
1. User selects Canvas document in Madison
2. Content extracted and used as context
3. Madison AI generates new content based on Canvas content
4. New content created in Madison (can push back to Canvas)

**Benefits:**
- Generate variations of Canvas content
- Create derivative content from Canvas designs
- Maintain brand consistency across platforms

---

## 🛠️ Implementation

### **1. Canvas Document Structure**

Canvas documents typically contain:
- **Blocks:** Rich text, images, embeds
- **Layouts:** Structured layouts with columns, grids
- **Components:** Reusable design components
- **Metadata:** Title, description, tags

### **2. Content Transformation**

**Canvas → Madison:**
```typescript
// Convert Canvas blocks to Madison format
function canvasToMadison(canvasDoc: CanvasDocument): MadisonContent {
  // Extract text from blocks
  // Convert images to references
  // Preserve structure (headings, lists, etc.)
  // Return Madison-compatible format
}
```

**Madison → Canvas:**
```typescript
// Convert Madison content to Canvas format
function madisonToCanvas(madisonContent: MadisonContent): CanvasDocument {
  // Convert Markdown/Portable Text to Canvas blocks
  // Create layout structure
  // Add images as Canvas assets
  // Return Canvas document structure
}
```

### **3. Edge Function for Canvas Operations**

Create `supabase/functions/canvas-sync/index.ts`:
- Fetch Canvas documents
- Transform between formats
- Create/update Canvas documents
- Handle Canvas-specific features (layouts, components)

---

## 📋 Canvas Document Types

Based on your Sanity project, you might want to create Canvas document types for:

1. **Content Canvas** - Rich content pieces (blog posts, articles)
2. **Product Canvas** - Product descriptions with visual layouts
3. **Marketing Canvas** - Marketing materials, campaigns
4. **Email Canvas** - Email designs with rich layouts

---

## 🎯 Use Cases

### **1. "Canvas → Madison → Canvas" Workflow**

1. Designer creates visual layout in Canvas
2. Content pulled into Madison
3. Writer enhances with AI, edits copy
4. Updated content pushed back to Canvas
5. Designer refines visual layout

### **2. "Madison → Canvas → Publish" Workflow**

1. Writer creates content in Madison
2. Content pushed to Canvas
3. Designer adds visual elements, layouts
4. Final piece published from Canvas

### **3. "Canvas Content Library"**

1. Canvas documents stored as content library
2. Madison can reference Canvas content
3. Generate variations, derivatives
4. Maintain single source of truth

---

## 🔧 Technical Details

### **Canvas API Access**

Canvas documents are accessible via Sanity API:
```groq
*[_type == "canvas.document" && _id == "9glD2Ob7xE3NcaXj7GisXH"] {
  _id,
  title,
  blocks[],
  layout,
  metadata
}
```

### **Canvas Block Types**

Common Canvas block types:
- `canvas.text` - Rich text
- `canvas.image` - Images
- `canvas.embed` - Embeds
- `canvas.layout` - Layout containers
- `canvas.component` - Reusable components

### **Integration Points**

1. **Madison UI:**
   - "Import from Canvas" button
   - "Push to Canvas" button
   - Canvas document picker

2. **Sanity Canvas:**
   - "Enhance with Madison" action
   - "Sync to Madison" option
   - Madison content preview

---

## 🚀 Next Steps

1. **Identify Canvas Document Structure**
   - What document type is `9glD2Ob7xE3NcaXj7GisXH`?
   - What fields does it contain?
   - What's the block structure?

2. **Create Canvas Schema in Sanity**
   - Define Canvas document types
   - Set up field mappings
   - Configure Canvas-specific fields

3. **Build Integration Components**
   - Canvas document fetcher
   - Content transformer
   - Canvas document creator/updater

4. **Add UI Components**
   - Canvas document picker in Madison
   - "Push to Canvas" button
   - Canvas content preview

---

## 💡 Questions to Answer

1. **What type of Canvas document is `9glD2Ob7xE3NcaXj7GisXH`?**
   - Content piece?
   - Product description?
   - Marketing material?

2. **What's the desired workflow?**
   - Canvas → Madison (import)
   - Madison → Canvas (export)
   - Bi-directional sync

3. **What content should sync?**
   - Text content only?
   - Images and media?
   - Layout structure?
   - Metadata?

---

## 📚 Resources

- [Sanity Canvas Documentation](https://www.sanity.io/docs/canvas)
- [Canvas API Reference](https://www.sanity.io/docs/canvas-api)
- [Sanity Client SDK](https://www.sanity.io/docs/js-client)

---

**Status:** Ready to implement once Canvas document structure is identified
**Next Action:** Analyze the Canvas document structure and create appropriate integration



