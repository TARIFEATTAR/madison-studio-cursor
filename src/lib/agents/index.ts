/**
 * Madison 4-Agent Pipeline
 * 
 * The intelligent content generation system powered by Claude.
 * 
 * @example
 * ```typescript
 * import { madisonPipeline } from '@/lib/agents';
 * 
 * const result = await madisonPipeline(
 *   "Write an Instagram caption for our new rose candle",
 *   orgId,
 *   { channel: 'instagram', includeImagePrompt: true }
 * );
 * 
 * console.log(result.content);
 * console.log(result.strategy.copySquad); // "THE_STORYTELLERS"
 * ```
 */

// Main pipeline export
export {
  madisonPipeline,
  quickGenerate,
  fullGenerate,
  type PipelineOptions,
} from './pipeline';

// Individual agent exports (for advanced use)
export { routerAgent } from './router';
export { assemblerAgent, fetchVisualMaster, generateEmbedding } from './assembler';
export { generatorAgent, generateImagePrompt } from './generator';
export { editorAgent, quickValidate, suggestAlternatives } from './editor';

// Re-export types
export type {
  RouterInput,
  StrategyJSON,
  ContextPackage,
  PipelineOutput,
  CopySquad,
  VisualSquad,
  AwarenessStage,
} from '@/types/madison';






