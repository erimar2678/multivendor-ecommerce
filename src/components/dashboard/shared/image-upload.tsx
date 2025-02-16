import { FC, useEffect, useState } from "react";

interface ImageUploadProps {
    disabled?: boolean;
    value: string[];
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    type: 'standard' | 'profile' | 'cover';
    dontShowPreview?: boolean;
}

const ImageUpload: FC<ImageUploadProps> = ({ 
    disabled, 
    value, 
    onChange, 
    onRemove, 
    type, 
    dontShowPreview,
 }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted) return null;

    return <div>ImageUpload</div>;
};

export default ImageUpload;