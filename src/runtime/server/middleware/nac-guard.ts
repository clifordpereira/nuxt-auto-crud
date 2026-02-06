import { defineEventHandler, getQuery, createError, type H3Event } from 'h3';
import { useRuntimeConfig } from '#imports';

/**
 * Allow Agentic/MCP access to NAC routes
 */
export default defineEventHandler(async (event) => {
    const pathname = new URL(event.path, 'http://internal').pathname
    if (!isAgenticPath(pathname)) return

    const token = getQuery(event).token as string;
    if (hasValidToken(event, token)) return

    throw createError({
        statusCode: 401,
        statusMessage: 'NAC Core: Unauthorized access - Invalid API Token',
    });
});


/**
 * Helper functions
 */
function isAgenticPath(pathname: string) { 
  const agenticPaths = ['/api/_nac/_meta'];  
  return agenticPaths.includes(pathname);
}

function hasValidToken(event: H3Event, token: string) {
    const apiToken = useRuntimeConfig(event).apiSecretToken;
    return (apiToken && token === apiToken);
}
