async function readResponseText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}

function getContentType(response: Response): string {
  return response.headers.get('content-type')?.toLowerCase() ?? '';
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = getContentType(response);

  if (!contentType.includes('application/json')) {
    const body = await readResponseText(response);
    throw new Error(
      body.startsWith('<!doctype') || body.startsWith('<html')
        ? 'The server returned an HTML error page instead of JSON.'
        : 'The server returned a non-JSON response.'
    );
  }

  return (await response.json()) as T;
}

export async function readErrorMessage(response: Response): Promise<string> {
  const contentType = getContentType(response);

  if (contentType.includes('application/json')) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    return payload?.message ?? 'Request failed';
  }

  const body = await readResponseText(response);

  if (body.startsWith('<!doctype') || body.startsWith('<html')) {
    return 'The server returned an HTML error page instead of JSON.';
  }

  return body || 'Request failed';
}
