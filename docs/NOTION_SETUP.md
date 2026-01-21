# Notion Integration Setup

This guide explains how to set up the Notion integration for syncing content to Madison Studio/Sanity.

## 1. Create Notion Integration

1. Go to [My Integrations](https://www.notion.so/my-integrations) in Notion.
2. Click **+ New integration**.
3. Name it **"Madison Studio Sync"**.
4. Select the workspace where your content lives.
5. Click **Submit**.
6. **Copy the "Internal Integration Secret"**. This is your `NOTION_API_KEY`.

## 2. Set Up Notion Database

Create a new database (or use an existing one) with the following **required properties**:

| Property Name | Type | Description |
|--------------|------|-------------|
| **Name** | Title | The title of your article. |
| **Status** | Select | Options: `Draft`, `Ready to Publish`, `Published`. only `Ready to Publish` items will be synced. |
| **Category** | Select | Options: `Field Notes`, `Behind the Blend`, `Territory Spotlight`, `Collector Archives`. |
| **Slug** | Text | (Optional) Custom URL slug. If empty, one will be generated from the title. |
| **Featured Image** | Files & Media | (Optional) The main image for the article. |
| **Publish Date** | Date | (Optional) When the article should be considered published. |

> **Important:** You must **share this database** with your integration.
> 1. Open the database page.
> 2. Click `...` (top right) -> `Connect to` -> `Madison Studio Sync`.
> 3. **Copy the Database ID** from the URL.
>    - URL format: `https://www.notion.so/myworkspace/{DATABASE_ID}?v=...`
>    - It is the 32-character string before the `?`.

## 3. Configure Madison Studio

1. In your local `.env` file, add the keys:
   ```bash
   NOTION_API_KEY="secret_..."
   NOTION_DATABASE_ID="database_id_..."
   ```

2. **For Production (Supabase):**
   Run these commands to set the secrets for the Edge Function:

   ```bash
   supabase secrets set NOTION_API_KEY=your_secret_key --project-ref likkskifwsrvszxdvufw
   supabase secrets set NOTION_DATABASE_ID=your_database_id --project-ref likkskifwsrvszxdvufw
   ```

## 4. Sync Content

Once configured, you can trigger the sync via:

**API Endpoint:**
`POST https://likkskifwsrvszxdvufw.supabase.co/functions/v1/sync-notion`

*(You can set up a button in Madison Studio or a cron job to call this endpoint).*
