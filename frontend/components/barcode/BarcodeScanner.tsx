'use client';

import { useState, useEffect, useRef } from 'react';
import { Camera, X, Keyboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function BarcodeScanner({ onScan, onClose, title, description }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if camera is available
  useEffect(() => {
    checkCameraAvailability();

    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setHasCamera(videoDevices.length > 0);

      if (videoDevices.length > 0) {
        setMode('camera');
      }
    } catch (error) {
      console.error('Error checking camera:', error);
      setHasCamera(false);
      setMode('manual');
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Start barcode detection
      startBarcodeDetection();
    } catch (error: any) {
      console.error('Error starting camera:', error);
      setCameraError(error.message || 'Failed to access camera');
      setMode('manual');
      toast.error('Camera access denied. Please use manual entry.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  const startBarcodeDetection = async () => {
    // Check if Barcode Detection API is available
    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
        });

        const detect = async () => {
          if (!videoRef.current || !streamRef.current) return;

          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);

            if (barcodes.length > 0) {
              const barcode = barcodes[0].rawValue;
              stopCamera();
              onScan(barcode);
              toast.success('Barcode detected successfully!');
            } else {
              // Continue scanning
              requestAnimationFrame(detect);
            }
          } catch (error) {
            console.error('Detection error:', error);
            requestAnimationFrame(detect);
          }
        };

        detect();
      } catch (error) {
        console.error('BarcodeDetector error:', error);
        setCameraError('Barcode detection not supported. Please use manual entry.');
        setMode('manual');
      }
    } else {
      // Fallback: show manual entry
      toast.info('Barcode scanning not supported on this device. Please enter manually.');
      setMode('manual');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    onScan(manualBarcode.trim());
    setManualBarcode('');
  };

  useEffect(() => {
    if (mode === 'camera' && hasCamera && !isScanning) {
      startCamera();
    }
  }, [mode]);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title || 'Scan Barcode'}</CardTitle>
            <CardDescription>
              {description || 'Scan a book barcode or enter it manually'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mode Switcher */}
        <div className="flex gap-2">
          {hasCamera && (
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                stopCamera();
                setMode('camera');
              }}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Camera
            </Button>
          )}
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              stopCamera();
              setMode('manual');
            }}
            className="flex-1"
          >
            <Keyboard className="h-4 w-4 mr-2" />
            Manual Entry
          </Button>
        </div>

        {/* Camera Error */}
        {cameraError && (
          <Alert variant="destructive">
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />

              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-primary rounded-lg animate-pulse" />
                </div>
              )}

              {!isScanning && streamRef.current && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Position the barcode within the frame
            </p>
          </div>
        )}

        {/* Manual Entry Mode */}
        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter barcode number..."
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                autoFocus
                className="text-lg text-center tracking-wider"
              />
            </div>

            <Button type="submit" className="w-full" disabled={!manualBarcode.trim()}>
              Lookup Book
            </Button>
          </form>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold">Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Hold the barcode steady and within the frame</li>
            <li>Ensure good lighting conditions</li>
            <li>Keep the camera at appropriate distance</li>
            <li>Use manual entry if scanning doesn't work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
