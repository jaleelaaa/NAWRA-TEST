'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  BookOpen,
  Users,
  Book,
  BookMarked,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronLeft,
  Home,
  CheckCircle2,
  Circle,
  Lightbulb,
  AlertCircle,
  Info,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Section =
  | 'welcome'
  | 'gettingStarted'
  | 'userManagement'
  | 'bookCatalog'
  | 'circulation'
  | 'reports'
  | 'settings';

export default function GuidePage() {
  const t = useTranslations('guide');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [currentSection, setCurrentSection] = useState<Section>('welcome');
  const [completedSections, setCompletedSections] = useState<Section[]>([]);

  const sections = [
    { id: 'gettingStarted' as Section, icon: Home, color: 'bg-blue-500' },
    { id: 'userManagement' as Section, icon: Users, color: 'bg-purple-500' },
    { id: 'bookCatalog' as Section, icon: Book, color: 'bg-green-500' },
    { id: 'circulation' as Section, icon: BookMarked, color: 'bg-orange-500' },
    { id: 'reports' as Section, icon: BarChart3, color: 'bg-pink-500' },
    { id: 'settings' as Section, icon: Settings, color: 'bg-indigo-500' },
  ];

  const markSectionComplete = (section: Section) => {
    if (!completedSections.includes(section)) {
      setCompletedSections([...completedSections, section]);
    }
  };

  const progress = (completedSections.length / sections.length) * 100;

  const renderWelcome = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-[#8B2635] to-[#6B1F2E] text-white border-none">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-full">
              <BookOpen size={48} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            {t('welcome.title')}
          </CardTitle>
          <CardDescription className="text-white/90 text-lg">
            {t('welcome.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setCurrentSection('gettingStarted')}
            className="px-8"
          >
            {t('welcome.getStarted')}
            {isRTL ? <ChevronLeft className="ml-2" /> : <ChevronRight className="mr-2" />}
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">
          {t('welcome.features')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isCompleted = completedSections.includes(section.id);

            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-[#8B2635]"
                onClick={() => setCurrentSection(section.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 ${section.color} text-white rounded-lg`}>
                      <Icon size={24} />
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="text-green-500" size={24} />
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">
                    {t(`sections.${section.id}`)}
                  </CardTitle>
                  <CardDescription>
                    {t(`${section.id}.intro`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <HelpCircle className="text-blue-600" size={24} />
            <CardTitle className="text-blue-900">{t('help.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800">
          <p>{t('help.description')}</p>
          <p className="font-medium">{t('help.contact')}</p>
          <p>{t('help.email')}</p>
          <p>{t('help.phone')}</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep = (stepKey: string, stepData: any) => (
    <div className="space-y-4 p-6 bg-white rounded-lg border-2 border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#8B2635] text-white flex items-center justify-center text-sm">
          {stepKey.replace('step', '')}
        </div>
        {stepData.title}
      </h4>

      <p className="text-gray-700 leading-relaxed">{stepData.description}</p>

      {/* List items (for gettingStarted.step2, step3, etc.) */}
      {stepData.items && (
        <ul className="space-y-2">
          {stepData.items.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Menu items */}
      {stepData.menuItems && (
        <ul className="space-y-2">
          {stepData.menuItems.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <ChevronRight className="text-[#8B2635] mt-0.5 flex-shrink-0" size={18} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Fields */}
      {stepData.fields && (
        <ul className="space-y-2">
          {stepData.fields.map((field: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <Circle className="text-[#8B2635] mt-1 flex-shrink-0" size={12} />
              <span>{field}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Steps (for circulation.step2) */}
      {stepData.steps && (
        <ol className="space-y-2">
          {stepData.steps.map((step: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <span className="font-semibold text-[#8B2635]">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Types (for reports.step2) */}
      {stepData.types && (
        <ul className="space-y-2">
          {stepData.types.map((type: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <CheckCircle2 className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
              <span>{type}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Filters */}
      {stepData.filters && (
        <ul className="space-y-2">
          {stepData.filters.map((filter: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-gray-700">
              <Circle className="text-[#8B2635] mt-1 flex-shrink-0" size={12} />
              <span>{filter}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Info */}
      {stepData.info && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-blue-900">{stepData.info}</p>
        </div>
      )}

      {/* Tip */}
      {stepData.tip && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Lightbulb className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-yellow-900">{stepData.tip}</p>
        </div>
      )}

      {/* Action */}
      {stepData.action && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-900">{stepData.action}</p>
        </div>
      )}

      {/* Warning */}
      {stepData.warning && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-900 font-medium">{stepData.warning}</p>
        </div>
      )}

      {/* Screenshot Placeholder */}
      <div className="mt-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
          <ImageIcon size={48} className="text-gray-400" />
          <p className="text-center font-medium">{stepData.screenshot}</p>
          <Badge variant="outline" className="text-xs">
            {locale === 'ar' ? 'سيتم إضافة لقطة الشاشة هنا' : 'Screenshot will be placed here'}
          </Badge>
        </div>
      </div>
    </div>
  );

  const renderSection = (sectionId: Section) => {
    // Count number of steps
    let stepCount = 0;
    let stepNum = 1;
    while (t.has(`${sectionId}.step${stepNum}`)) {
      stepCount++;
      stepNum++;
    }

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Section Header */}
        <Card className="bg-gradient-to-r from-[#8B2635] to-[#6B1F2E] text-white border-none">
          <CardHeader>
            <CardTitle className="text-2xl">{t(`${sectionId}.title`)}</CardTitle>
            <CardDescription className="text-white/90 text-base">
              {t(`${sectionId}.intro`)}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Steps */}
        <div className="space-y-6">
          {Array.from({ length: stepCount }, (_, i) => {
            const stepKey = `step${i + 1}`;
            const stepData = {
              title: t(`${sectionId}.${stepKey}.title`),
              description: t(`${sectionId}.${stepKey}.description`),
              screenshot: t(`${sectionId}.${stepKey}.screenshot`),
              tip: t.has(`${sectionId}.${stepKey}.tip`) ? t(`${sectionId}.${stepKey}.tip`) : null,
              info: t.has(`${sectionId}.${stepKey}.info`) ? t(`${sectionId}.${stepKey}.info`) : null,
              warning: t.has(`${sectionId}.${stepKey}.warning`) ? t(`${sectionId}.${stepKey}.warning`) : null,
              action: t.has(`${sectionId}.${stepKey}.action`) ? t(`${sectionId}.${stepKey}.action`) : null,
              items: t.has(`${sectionId}.${stepKey}.items`) ? t.raw(`${sectionId}.${stepKey}.items`) : null,
              menuItems: t.has(`${sectionId}.${stepKey}.menuItems`) ? t.raw(`${sectionId}.${stepKey}.menuItems`) : null,
              fields: t.has(`${sectionId}.${stepKey}.fields`) ? t.raw(`${sectionId}.${stepKey}.fields`) : null,
              steps: t.has(`${sectionId}.${stepKey}.steps`) ? t.raw(`${sectionId}.${stepKey}.steps`) : null,
              types: t.has(`${sectionId}.${stepKey}.types`) ? t.raw(`${sectionId}.${stepKey}.types`) : null,
              filters: t.has(`${sectionId}.${stepKey}.filters`) ? t.raw(`${sectionId}.${stepKey}.filters`) : null,
            };
            return renderStep(stepKey, stepData);
          })}
        </div>

        {/* Quick Tips */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Lightbulb size={24} />
              {t('tips.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {['tip1', 'tip2', 'tip3', 'tip4', 'tip5'].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-purple-900">
                  <CheckCircle2 className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
                  <span>{t(`tips.${tip}`)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Complete Section Button */}
        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => {
              markSectionComplete(sectionId);
              setCurrentSection('welcome');
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className={isRTL ? 'ml-2' : 'mr-2'} />
            {t('navigation.complete')}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600 text-lg">{t('subtitle')}</p>
      </div>

      {/* Progress Bar */}
      {currentSection !== 'welcome' && (
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-none">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">{t('navigation.progress')}</span>
                <span className="text-gray-600">
                  {completedSections.length} / {sections.length} {locale === 'ar' ? 'أقسام' : 'sections'}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Bar */}
      {currentSection !== 'welcome' && (
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => setCurrentSection('welcome')}
            className="flex items-center gap-2"
          >
            {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {t('navigation.backToMenu')}
          </Button>
        </div>
      )}

      {/* Content */}
      {currentSection === 'welcome' ? renderWelcome() : renderSection(currentSection)}
    </div>
  );
}
