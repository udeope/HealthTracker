'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  Settings,
  Layout,
  Database,
  Shield,
  Copy,
  Move,
  Grid,
  Type,
  BarChart3,
  Image,
  Table
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MedicalReportsService, type ReportTemplate, type TemplateField } from '@/lib/medical-reports-system';

interface TemplateEditorProps {
  onTemplateCreated?: (template: ReportTemplate) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'number', label: 'Número', icon: Type },
  { value: 'date', label: 'Fecha', icon: Type },
  { value: 'select', label: 'Selección', icon: Type },
  { value: 'multiselect', label: 'Selección Múltiple', icon: Type },
  { value: 'textarea', label: 'Área de Texto', icon: Type },
  { value: 'chart', label: 'Gráfico', icon: BarChart3 },
  { value: 'table', label: 'Tabla', icon: Table },
  { value: 'image', label: 'Imagen', icon: Image }
];

const SPECIALTIES = [
  { value: 'cardiology', label: 'Cardiología' },
  { value: 'neurology', label: 'Neurología' },
  { value: 'endocrinology', label: 'Endocrinología' },
  { value: 'psychiatry', label: 'Psiquiatría' },
  { value: 'general', label: 'Medicina General' },
  { value: 'pediatrics', label: 'Pediatría' },
  { value: 'geriatrics', label: 'Geriatría' }
];

export function TemplateEditor({ onTemplateCreated }: TemplateEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    name: '',
    specialty: '',
    description: '',
    fields: [],
    layout: {
      sections: [],
      style: 'professional'
    },
    validation_rules: [],
    auto_fill_rules: [],
    is_active: true
  });
  const [selectedField, setSelectedField] = useState<TemplateField | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  const handleSaveTemplate = async () => {
    try {
      if (!template.name || !template.specialty) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }

      const newTemplate = await MedicalReportsService.createCustomTemplate(template as any);
      toast.success('Plantilla creada exitosamente');
      onTemplateCreated?.(newTemplate);
      setIsOpen(false);
      resetTemplate();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Error al crear la plantilla');
    }
  };

  const resetTemplate = () => {
    setTemplate({
      name: '',
      specialty: '',
      description: '',
      fields: [],
      layout: {
        sections: [],
        style: 'professional'
      },
      validation_rules: [],
      auto_fill_rules: [],
      is_active: true
    });
    setCurrentTab('basic');
  };

  const addField = (fieldData: Partial<TemplateField>) => {
    const newField: TemplateField = {
      id: Date.now().toString(),
      name: fieldData.name || '',
      label: fieldData.label || '',
      type: fieldData.type || 'text',
      required: fieldData.required || false,
      position: {
        row: template.fields?.length || 0,
        col: 0
      }
    };

    setTemplate(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField]
    }));
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields?.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields?.filter(field => field.id !== fieldId)
    }));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(template.fields || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTemplate(prev => ({
      ...prev,
      fields: items.map((field, index) => ({
        ...field,
        position: { ...field.position, row: index }
      }))
    }));
  };

  const renderBasicTab = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la Plantilla *</Label>
        <Input
          id="name"
          value={template.name}
          onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
          placeholder="ej. Reporte Cardiológico Integral"
        />
      </div>

      <div>
        <Label htmlFor="specialty">Especialidad *</Label>
        <Select value={template.specialty} onValueChange={(value) => setTemplate(prev => ({ ...prev, specialty: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar especialidad" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((specialty) => (
              <SelectItem key={specialty.value} value={specialty.value}>
                {specialty.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={template.description}
          onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe el propósito y contenido de esta plantilla"
        />
      </div>

      <div>
        <Label htmlFor="style">Estilo de Diseño</Label>
        <Select 
          value={template.layout?.style} 
          onValueChange={(value) => setTemplate(prev => ({ 
            ...prev, 
            layout: { ...prev.layout!, style: value as any }
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Profesional</SelectItem>
            <SelectItem value="clinical">Clínico</SelectItem>
            <SelectItem value="research">Investigación</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderFieldsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Campos de la Plantilla</h4>
        <Button
          size="sm"
          onClick={() => {
            setSelectedField(null);
            setIsFieldDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Campo
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {template.fields?.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    >
                      <div className="flex items-center space-x-3">
                        <Grid className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {FIELD_TYPES.find(t => t.value === field.type)?.label}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">Requerido</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedField(field);
                            setIsFieldDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {template.fields?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay campos agregados</p>
          <p className="text-sm">Haz clic en "Agregar Campo" para comenzar</p>
        </div>
      )}
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-4">
      <div>
        <Label>Secciones del Reporte</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Organiza los campos en secciones lógicas
        </p>
        
        <div className="space-y-3">
          {template.layout?.sections?.map((section, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Input
                  value={section.name}
                  onChange={(e) => {
                    const newSections = [...(template.layout?.sections || [])];
                    newSections[index] = { ...section, name: e.target.value };
                    setTemplate(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, sections: newSections }
                    }));
                  }}
                  placeholder="Nombre de la sección"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newSections = template.layout?.sections?.filter((_, i) => i !== index) || [];
                    setTemplate(prev => ({
                      ...prev,
                      layout: { ...prev.layout!, sections: newSections }
                    }));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.fields.map((fieldName) => (
                  <Badge key={fieldName} variant="secondary" className="text-xs">
                    {template.fields?.find(f => f.name === fieldName)?.label || fieldName}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => {
              const newSection = { name: '', fields: [], columns: 1 };
              setTemplate(prev => ({
                ...prev,
                layout: {
                  ...prev.layout!,
                  sections: [...(prev.layout?.sections || []), newSection]
                }
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Sección
          </Button>
        </div>
      </div>
    </div>
  );

  const renderValidationTab = () => (
    <div className="space-y-4">
      <div>
        <Label>Reglas de Validación</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Define reglas para validar la integridad de los datos
        </p>
        
        <div className="space-y-3">
          {template.validation_rules?.map((rule, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="grid grid-cols-3 gap-3">
                <Select
                  value={rule.field}
                  onValueChange={(value) => {
                    const newRules = [...(template.validation_rules || [])];
                    newRules[index] = { ...rule, field: value };
                    setTemplate(prev => ({ ...prev, validation_rules: newRules }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {template.fields?.map((field) => (
                      <SelectItem key={field.id} value={field.name}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={rule.rule}
                  onValueChange={(value) => {
                    const newRules = [...(template.validation_rules || [])];
                    newRules[index] = { ...rule, rule: value };
                    setTemplate(prev => ({ ...prev, validation_rules: newRules }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Regla" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="required">Requerido</SelectItem>
                    <SelectItem value="range">Rango</SelectItem>
                    <SelectItem value="pattern">Patrón</SelectItem>
                    <SelectItem value="custom">Personalizada</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newRules = template.validation_rules?.filter((_, i) => i !== index) || [];
                    setTemplate(prev => ({ ...prev, validation_rules: newRules }));
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Input
                className="mt-2"
                value={rule.message}
                onChange={(e) => {
                  const newRules = [...(template.validation_rules || [])];
                  newRules[index] = { ...rule, message: e.target.value };
                  setTemplate(prev => ({ ...prev, validation_rules: newRules }));
                }}
                placeholder="Mensaje de error"
              />
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={() => {
              const newRule = { field: '', rule: '', params: {}, message: '', severity: 'error' as const };
              setTemplate(prev => ({
                ...prev,
                validation_rules: [...(prev.validation_rules || []), newRule]
              }));
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Regla
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nueva Plantilla</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="w-5 h-5" />
              <span>Editor de Plantillas</span>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="fields">Campos</TabsTrigger>
              <TabsTrigger value="layout">Diseño</TabsTrigger>
              <TabsTrigger value="validation">Validación</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {renderBasicTab()}
            </TabsContent>

            <TabsContent value="fields" className="space-y-4">
              {renderFieldsTab()}
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              {renderLayoutTab()}
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              {renderValidationTab()}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-6">
            <div className="flex space-x-2">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Vista Previa
              </Button>
              <Button variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Plantilla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar campos */}
      <FieldEditor
        field={selectedField}
        isOpen={isFieldDialogOpen}
        onClose={() => setIsFieldDialogOpen(false)}
        onSave={(fieldData) => {
          if (selectedField) {
            updateField(selectedField.id, fieldData);
          } else {
            addField(fieldData);
          }
          setIsFieldDialogOpen(false);
        }}
      />
    </>
  );
}

// Componente para editar campos individuales
function FieldEditor({ 
  field, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  field: TemplateField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: Partial<TemplateField>) => void;
}) {
  const [fieldData, setFieldData] = useState<Partial<TemplateField>>({});

  useEffect(() => {
    if (field) {
      setFieldData(field);
    } else {
      setFieldData({
        name: '',
        label: '',
        type: 'text',
        required: false
      });
    }
  }, [field]);

  const handleSave = () => {
    if (!fieldData.name || !fieldData.label) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }
    onSave(fieldData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {field ? 'Editar Campo' : 'Nuevo Campo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="field-name">Nombre del Campo *</Label>
            <Input
              id="field-name"
              value={fieldData.name}
              onChange={(e) => setFieldData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ej. blood_pressure_systolic"
            />
          </div>

          <div>
            <Label htmlFor="field-label">Etiqueta *</Label>
            <Input
              id="field-label"
              value={fieldData.label}
              onChange={(e) => setFieldData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="ej. Presión Arterial Sistólica"
            />
          </div>

          <div>
            <Label htmlFor="field-type">Tipo de Campo</Label>
            <Select 
              value={fieldData.type} 
              onValueChange={(value) => setFieldData(prev => ({ ...prev, type: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="field-required"
              checked={fieldData.required}
              onChange={(e) => setFieldData(prev => ({ ...prev, required: e.target.checked }))}
            />
            <Label htmlFor="field-required">Campo requerido</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}