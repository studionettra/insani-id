import React, { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = React.lazy(() => import('react-quill-new'));

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const quillRef = useRef<any>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files ? input.files[0] : null;

            if (!file) {
return;
}

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/upload-image', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const data = await response.json();
                const url = data.url;
                
                // Get quill instance and insert the image
                const quill = quillRef.current?.getEditor();

                if (quill) {
                    const range = quill.getSelection(true);

                    if (range) {
                        quill.insertEmbed(range.index, 'image', url);
                        quill.setSelection(range.index + 1, 0);
                    } else {
                        quill.insertEmbed(0, 'image', url);
                    }
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Gagal mengunggah gambar. Pastikan ukuran kurang dari 10MB.');
            }
        };
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video'
    ];

    if (!isMounted) {
        return <div className="h-[250px] w-full bg-slate-50 animate-pulse rounded-md border border-slate-200"></div>;
    }

    return (
        <div className="bg-white rounded-md">
            <Suspense fallback={<div className="h-[250px] w-full bg-slate-50 animate-pulse rounded-md border border-slate-200"></div>}>
                <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder || 'Tulis di sini...'}
                />
            </Suspense>
        </div>
    );
}