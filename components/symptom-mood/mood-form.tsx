'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Calendar as CalendarIcon,
  Smile,
  Frown,
  Meh,
  Heart,
  Battery,
  Zap,
  Moon,
  Users,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SymptomMoodService, type MoodEntry } from '@/lib/local-storage-system';

interface MoodFormProps {
  userId: string;
  onMoodAdded?: () => void;
}

const MOOD_LEVELS = [
  { value: 1, label: 'Muy mal', icon: Frown, color: 'text-red-600' },
  { value: 2, label: 'Mal', icon: Frown, color: 'text-orange-600' },
  { value: 3, label: 'Regular', icon: Meh, color: 'text-yellow-600' },
  { value: 4, label: 'Bien', icon: Smile, color: 'text-green-600' },
  { value: 5, label: 'Muy bien', icon: Smile, color: 'text-blue-600' }
];

const EMOTIONS = [
  'Feliz', 'Triste', 'Ansioso', 'Enojado', 'Frustrado', 'Emocionado',
  'Calmado', 'Estresado', 'Optimista', 'Pesimista', 'Agradecido',
  'Solitario', 'Abrumado', 'Confiado', 'Inseguro', 'Motivado'
];

const SOCIAL_INTERACTIONS = [
  { value: 'none', label: 'Ninguna' },
  { value: 'minimal', label: 'Mínima' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'high', label: 'Alta' }
];

const PHYSICAL_ACTIVITIES = [
  { value: 'none', label: 'Ninguna' },
  { value: 'light', label: 'Ligera' },
  { value: 'moderate', label: 'Moderada' },
  { value: 'intense', label: 'Intensa' }
];

const WEATHER_IMPACTS = [
  { value: 'positive', label: 'Positivo' },
  { value: 'negative', label: 'Negativo' },
  { value: 'neutral', label: 'Neutral' }
];

export function MoodForm({ userId, onMoodAdded }: MoodFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [moodData, setMoodData] = useState({
    entry_date: new Date(),
    entry_time: format(new Date(), 'HH:mm'),
    overall_mood: 3,
    specific_emotions: [] as string[],
    energy_level: 5,
    stress_level: 5,
    anxiety_level: 5,
    sleep_quality: 5,
    sleep_hours: 8,
    social_interaction: '',
    physical_activity: '',
    weather_mood_impact: '',
    menstrual_cycle_day: 0,
    notes: ''
  });

  const handleMoodChange = (field: string, value: any) => {
    setMoodData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmotionToggle = (emotion: string) => {
    setMoodData(prev => ({
      ...prev,
      specific_emotions: prev.specific_emotions.includes(emotion)
        ? prev.specific_emotions.filter(e => e !== emotion)
        : [...prev.specific_emotions, emotion]
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await SymptomMoodService.createMoodEntry({
        user_id: userId,
        entry_date: format(moodData.entry_date, 'yyyy-MM-dd'),
        entry_time: moodData.entry_time,
        overall_mood: moodData.overall_mood,
        specific_emotions: moodData.specific_emotions.length > 0 ? moodData.specific_emotions : undefined,
        energy_level: moodData.energy_level,
        stress_level: moodData.stress_level,
        anxiety_level: moodData.anxiety_level,
        sleep_quality: moodData.sleep_quality,
        sleep_hours: moodData.sleep_hours,
        social_interaction: moodData.social_interaction || undefined,
        physical_activity: moodData.physical_activity || undefined,
        weather_mood_impact: moodData.weather_mood_impact || undefined,
        menstrual_cycle_day: moodData.menstrual_cycle_day > 0 ? moodData.menstrual_cycle_day : undefined,
        notes: moodData.notes || undefined
      });

      toast.success('Estado de ánimo registrado exitosamente');
      resetForm();
      setIsOpen(false);
      onMoodAdded?.();

    } catch (error) {
      console.error('Error adding mood entry:', error);
      toast.error('Error al registrar el estado de ánimo');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMoodData({
      entry_date: new Date(),
      entry_time: format(new Date(), 'HH:mm'),
      overall_mood: 3,
      specific_emotions: [],
      energy_level: 5,
      stress_level: 5,
      anxiety_level: 5,
      sleep_quality: 5,
      sleep_hours: 8,
      social_interaction: '',
      physical_activity: '',
      weather_mood_impact: '',
      menstrual_cycle_day: 0,
      notes: ''
    });
  };

  const getCurrentMoodLevel = () => {
    return MOOD_LEVELS.find(level => level.value === moodData.overall_mood) || MOOD_LEVELS[2];
  };

  const currentMoodLevel = getCurrentMoodLevel();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Heart className="w-4 h-4" />
          <span>Registrar Estado de Ánimo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Registro de Estado de Ánimo</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !moodData.entry_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {moodData.entry_date ? format(moodData.entry_date, "dd/MM/yyyy") : "Seleccionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={moodData.entry_date}
                    onSelect={(date) => handleMoodChange('entry_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={moodData.entry_time}
                onChange={(e) => handleMoodChange('entry_time', e.target.value)}
              />
            </div>
          </div>

          {/* Estado de ánimo general */}
          <div>
            <Label className="text-base font-semibold">Estado de Ánimo General</Label>
            <div className="mt-4">
              <div className="flex justify-center mb-4">
                <div className={`text-6xl ${currentMoodLevel.color}`}>
                  <currentMoodLevel.icon />
                </div>
              </div>
              <div className="text-center mb-4">
                <span className={`text-lg font-semibold ${currentMoodLevel.color}`}>
                  {currentMoodLevel.label}
                </span>
              </div>
              <div className="px-3 py-2">
                <Slider
                  value={[moodData.overall_mood]}
                  onValueChange={(value) => handleMoodChange('overall_mood', value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>Muy mal</span>
                  <span>Regular</span>
                  <span>Muy bien</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emociones específicas */}
          <div>
            <Label>Emociones Específicas</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMOTIONS.map((emotion) => (
                <Button
                  key={emotion}
                  size="sm"
                  variant={moodData.specific_emotions.includes(emotion) ? "default" : "outline"}
                  onClick={() => handleEmotionToggle(emotion)}
                >
                  {emotion}
                </Button>
              ))}
            </div>
          </div>

          {/* Niveles de energía, estrés y ansiedad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="flex items-center space-x-2">
                <Battery className="w-4 h-4" />
                <span>Nivel de Energía</span>
              </Label>
              <div className="px-3 py-2">
                <Slider
                  value={[moodData.energy_level]}
                  onValueChange={(value) => handleMoodChange('energy_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium mt-1">
                  {moodData.energy_level}/10
                </div>
              </div>
            </div>

            <div>
              <Label className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Nivel de Estrés</span>
              </Label>
              <div className="px-3 py-2">
                <Slider
                  value={[moodData.stress_level]}
                  onValueChange={(value) => handleMoodChange('stress_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium mt-1">
                  {moodData.stress_level}/10
                </div>
              </div>
            </div>

            <div>
              <Label>Nivel de Ansiedad</Label>
              <div className="px-3 py-2">
                <Slider
                  value={[moodData.anxiety_level]}
                  onValueChange={(value) => handleMoodChange('anxiety_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium mt-1">
                  {moodData.anxiety_level}/10
                </div>
              </div>
            </div>
          </div>

          {/* Sueño */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center space-x-2">
                <Moon className="w-4 h-4" />
                <span>Calidad del Sueño (1-10)</span>
              </Label>
              <div className="px-3 py-2">
                <Slider
                  value={[moodData.sleep_quality]}
                  onValueChange={(value) => handleMoodChange('sleep_quality', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm font-medium mt-1">
                  {moodData.sleep_quality}/10
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="sleep_hours">Horas de Sueño</Label>
              <Input
                id="sleep_hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={moodData.sleep_hours}
                onChange={(e) => handleMoodChange('sleep_hours', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Actividades y contexto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Interacción Social</span>
              </Label>
              <Select value={moodData.social_interaction} onValueChange={(value) => handleMoodChange('social_interaction', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_INTERACTIONS.map((interaction) => (
                    <SelectItem key={interaction.value} value={interaction.value}>
                      {interaction.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Actividad Física</span>
              </Label>
              <Select value={moodData.physical_activity} onValueChange={(value) => handleMoodChange('physical_activity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {PHYSICAL_ACTIVITIES.map((activity) => (
                    <SelectItem key={activity.value} value={activity.value}>
                      {activity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Impacto del Clima</Label>
              <Select value={moodData.weather_mood_impact} onValueChange={(value) => handleMoodChange('weather_mood_impact', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHER_IMPACTS.map((impact) => (
                    <SelectItem key={impact.value} value={impact.value}>
                      {impact.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ciclo menstrual (opcional) */}
          <div>
            <Label htmlFor="menstrual_cycle">Día del Ciclo Menstrual (opcional)</Label>
            <Input
              id="menstrual_cycle"
              type="number"
              min="0"
              max="35"
              value={moodData.menstrual_cycle_day}
              onChange={(e) => handleMoodChange('menstrual_cycle_day', parseInt(e.target.value) || 0)}
              placeholder="0 si no aplica"
            />
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={moodData.notes}
              onChange={(e) => handleMoodChange('notes', e.target.value)}
              placeholder="¿Algo específico que influyó en tu estado de ánimo hoy?"
            />
          </div>

          {/* Botón de envío */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              'Guardar Estado de Ánimo'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}