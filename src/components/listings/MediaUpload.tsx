import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';

type MediaRow = { id: string; storage_path: string; type: string; sort_order: number };

const BUCKET = 'listing-media';
const MAX_PHOTOS = 3;

export function MediaUpload({ listingId }: { listingId: string }) {
  const [media, setMedia]       = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [listingId]);

  async function fetchMedia() {
    const { data } = await supabase
      .from('listing_media')
      .select('id, storage_path, type, sort_order')
      .eq('listing_id', listingId)
      .order('sort_order');
    setMedia(data ?? []);
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const remaining = MAX_PHOTOS - media.length;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    setUploading(true);
    setError(null);

    const toUpload = Array.from(files).slice(0, remaining);

    for (const file of toUpload) {
      const ext  = file.name.split('.').pop() ?? 'jpg';
      const uuid = crypto.randomUUID();
      const path = `${listingId}/${uuid}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type });

      if (uploadErr) {
        setError(uploadErr.message);
        break;
      }

      const { error: dbErr } = await supabase.from('listing_media').insert({
        listing_id:   listingId,
        type:         'photo',
        storage_path: path,
        sort_order:   media.length + toUpload.indexOf(file),
      });

      if (dbErr) {
        setError(dbErr.message);
        break;
      }
    }

    await fetchMedia();
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleDelete(m: MediaRow) {
    await supabase.storage.from(BUCKET).remove([m.storage_path]);
    await supabase.from('listing_media').delete().eq('id', m.id);
    await fetchMedia();
  }

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Photos ({media.length} / {MAX_PHOTOS})</p>
        {media.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-input px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Add photos'}
          </button>
        )}
      </div>

      <input
        ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        multiple className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      {media.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {media.map(m => (
            <div key={m.id} className="group relative aspect-video overflow-hidden rounded-md border bg-muted">
              <img
                src={getPublicUrl(m.storage_path)}
                alt="Listing photo"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(m)}
                className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 py-0.5 text-xs text-white group-hover:block"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          Click to add photos (up to {MAX_PHOTOS})
        </div>
      )}
    </div>
  );
}
