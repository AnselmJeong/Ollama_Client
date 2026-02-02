// This file now only contains types and tool schemas to avoid Node.js dependency in Renderer
export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export const webSearchTool = {
  type: 'function',
  function: {
    name: 'webSearch',
    description: 'Performs a web search for the given query.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query string.' },
      },
      required: ['query'],
    },
  },
};

export const webFetchTool = {
  type: 'function',
  function: {
    name: 'webFetch',
    description: 'Fetches a single page by URL.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'A single URL to fetch.' },
      },
      required: ['url'],
    },
  },
};
