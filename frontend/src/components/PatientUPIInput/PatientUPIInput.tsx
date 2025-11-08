/**
 * Patient UPI Input Component
 * 
 * Reusable component for entering/displaying patient UPI.
 * In production, this would be replaced with proper authentication.
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PatientUPIInputProps {
  onUPISubmit: (upi: string) => void;
  currentUPI?: string | null;
  onUPIChange?: () => void;
}

export function PatientUPIInput({ onUPISubmit, currentUPI, onUPIChange }: PatientUPIInputProps) {
  const [upiInput, setUPIInput] = useState('');
  const [showInput, setShowInput] = useState(!currentUPI);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (upiInput.trim()) {
      onUPISubmit(upiInput.trim());
      setUPIInput('');
      setShowInput(false);
    }
  };

  if (showInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Patient Identity (UPI)</CardTitle>
          <CardDescription>
            Your Unique Patient Identity allows you to access your medical records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="upi-input" className="block text-sm font-medium mb-2">
                UPI (Unique Patient Identity)
              </label>
              <input
                id="upi-input"
                type="text"
                value={upiInput}
                onChange={(e) => setUPIInput(e.target.value)}
                placeholder="UPI-XXXXXXXX"
                className="w-full rounded-lg border px-3 py-2"
                required
                pattern="UPI-[A-F0-9]{16}"
                title="Format: UPI- followed by 16 hexadecimal characters"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: UPI- followed by 16 hexadecimal characters
              </p>
            </div>
            <Button type="submit">Continue</Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (currentUPI) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Patient Identity</p>
              <p className="font-mono font-semibold">{currentUPI}</p>
            </div>
            {onUPIChange && (
              <Button variant="outline" size="sm" onClick={() => {
                setShowInput(true);
                onUPIChange();
              }}>
                Change UPI
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

