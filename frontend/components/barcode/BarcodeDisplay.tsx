'use client';

import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface BarcodeDisplayProps {
  barcode: string;
  bookId?: string;
  format?: string;
  showActions?: boolean;
}

export function BarcodeDisplay({ barcode, bookId, format = 'CODE128', showActions = true }: BarcodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(barcode);
      setCopied(true);
      toast.success('Barcode copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy barcode');
    }
  };

  const handleDownload = () => {
    // Create a simple barcode visualization using SVG
    const svg = generateBarcodeSVG(barcode, format);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode-${barcode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Barcode downloaded');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Barcode visualization */}
          <div className="bg-white p-4 rounded-lg border-2 border-dashed flex items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-2xl font-bold tracking-wider mb-2">
                {barcode}
              </div>
              <div className="h-24 flex items-center justify-center">
                {/* Simple barcode representation */}
                <div className="flex items-end gap-[1px] h-full">
                  {barcode.split('').map((char, index) => (
                    <div
                      key={index}
                      className="bg-black"
                      style={{
                        width: '3px',
                        height: `${60 + (parseInt(char, 36) % 20)}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Format: {format}
              </p>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Simple barcode SVG generator
function generateBarcodeSVG(barcode: string, format: string): string {
  const width = 300;
  const height = 150;
  const barWidth = 3;
  const bars = barcode.split('').map((char, index) => {
    const barHeight = 80 + (parseInt(char, 36) % 30);
    const x = index * (barWidth + 1);
    const y = (height - 60 - barHeight) / 2;
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="black"/>`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="white"/>
      <g transform="translate(10, 10)">
        ${bars}
      </g>
      <text x="${width / 2}" y="${height - 20}" font-family="monospace" font-size="14" text-anchor="middle" fill="black">
        ${barcode}
      </text>
      <text x="${width / 2}" y="${height - 5}" font-family="sans-serif" font-size="10" text-anchor="middle" fill="gray">
        ${format}
      </text>
    </svg>
  `.trim();
}
