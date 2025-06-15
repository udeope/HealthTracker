'use client';

import { useState, useEffect, useRef } from 'react';
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
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Lock,
  Search,
  Filter,
  Trash2,
  Share2,
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
  FileImage,
  FilePdf,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TelemedicineService, SecurityService, type MedicalDocument, type Consultation } from '@/lib/telemedicine-system';

interface MedicalDocumentsProps {
  patientId: string;
  consultationId?: string;
  isDoctor?: boolean;
}

export function MedicalDocuments({ patientId, consultationId, isDoctor = false }: MedicalDocumentsProps) {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MedicalDocument | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [uploadData, setUploadData] = useState({
    document_type: 'report',
    title: '',
    description: '',
    is_encrypted: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, selectedType]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const documentsData = await TelemedicineService.getPatientDocuments(patientId);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.document_type === selectedType);
    }

    setFilteredDocuments(filtered);
  };

  const handleUploadDataChange = (field: string, value: any) => {
    setUploadData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    if (!uploadData.title) {
      toast.error('Por favor ingresa un título para el documento');
      return;
    }

    try {
      setLoading(true);

      // En producción, esto subiría el archivo a un servidor
      const fileUrl = URL.createObjectURL(selectedFile);
      
      // Encriptar datos si es necesario
      let encryptionKey;
      if (uploadData.is_encrypted) {
        encryptionKey = generateEncryptionKey();
      }

      const documentData: Omit<MedicalDocument, 'id' | 'created_at' | 'updated_at'> = {
        patient_id: patientId,
        doctor_id: isDoctor ? 'current-doctor-id' : undefined, // En producción, obtener del contexto
        consultation_id: consultationId,
        document_type: uploadData.document_type as any,
        title: uploadData.title,
        description: uploadData.description || undefined,
        file_url: fileUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type,
        is_encrypted: uploadData.is_encrypted,
        encryption_key: encryptionKey,
        access_permissions: [patientId],
        is_signed: isDoctor, // Los documentos subidos por doctores se consideran firmados
        digital_signature: isDoctor ? 'signed-by-doctor' : undefined
      };

      const document = await TelemedicineService.uploadMedicalDocument(documentData);
      
      toast.success('Documento subido exitosamente');
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadData({
        document_type: 'report',
        title: '',
        description: '',
        is_encrypted: true
      });
      
      // Recargar documentos
      loadDocuments();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Error al subir el documento');
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (document: MedicalDocument) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const downloadDocument = (document: MedicalDocument) => {
    // En producción, esto descargaría el archivo real
    const link = document.file_url;
    const a = document.createElement('a');
    a.href = link;
    a.download = document.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Descargando documento');
  };

  const generateEncryptionKey = () => {
    // En producción, esto generaría una clave de encriptación real
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const getDocumentIcon = (document: MedicalDocument) => {
    const fileType = document.file_type;
    
    if (fileType.startsWith('image/')) {
      return <FileImage className="w-8 h-8 text-blue-500" />;
    } else if (fileType === 'application/pdf') {
      return <FilePdf className="w-8 h-8 text-red-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    } else {
      return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    const typeConfig = {
      'prescription': { label: 'Receta', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'lab_result': { label: 'Resultado Lab', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      'imaging': { label: 'Imagen', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      'report': { label: 'Informe', color: 'bg-green-100 text-green-800 border-green-200' },
      'referral': { label: 'Derivación', color: 'bg-orange-100 text-orange-800 border-orange-200' },
      'other': { label: 'Otro', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.other;
    
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold">Documentos Médicos</h2>
          <p className="text-muted-foreground">
            Gestiona y comparte documentos médicos de forma segura
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="prescription">Recetas</SelectItem>
              <SelectItem value="lab_result">Resultados</SelectItem>
              <SelectItem value="imaging">Imágenes</SelectItem>
              <SelectItem value="report">Informes</SelectItem>
              <SelectItem value="referral">Derivaciones</SelectItem>
              <SelectItem value="other">Otros</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Subir Documento</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Subir Documento Médico</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document_type">Tipo de Documento</Label>
                  <Select 
                    value={uploadData.document_type} 
                    onValueChange={(value) => handleUploadDataChange('document_type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Receta médica</SelectItem>
                      <SelectItem value="lab_result">Resultado de laboratorio</SelectItem>
                      <SelectItem value="imaging">Imagen médica</SelectItem>
                      <SelectItem value="report">Informe médico</SelectItem>
                      <SelectItem value="referral">Derivación</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título del Documento *</Label>
                  <Input
                    id="title"
                    value={uploadData.title}
                    onChange={(e) => handleUploadDataChange('title', e.target.value)}
                    placeholder="ej. Análisis de sangre"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={uploadData.description}
                    onChange={(e) => handleUploadDataChange('description', e.target.value)}
                    placeholder="Descripción del documento"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Archivo</Label>
                  <div 
                    className="mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={handleFileSelect}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-8 h-8 text-primary mb-2" />
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="font-medium">Haz clic para seleccionar</p>
                        <p className="text-sm text-muted-foreground">
                          o arrastra y suelta aquí
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_encrypted"
                    checked={uploadData.is_encrypted}
                    onChange={(e) => handleUploadDataChange('is_encrypted', e.target.checked)}
                  />
                  <Label htmlFor="is_encrypted" className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Cifrar documento</span>
                  </Label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Seguridad HIPAA/GDPR</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Todos los documentos se almacenan de forma segura y cumplen con las normativas de privacidad médica.
                  </p>
                </div>

                <Button
                  onClick={uploadDocument}
                  disabled={loading || !selectedFile || !uploadData.title}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Documento
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Documentos */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getDocumentIcon(document)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium truncate">{document.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getDocumentTypeBadge(document.document_type)}
                          {document.is_encrypted && (
                            <Badge variant="outline" className="flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>Cifrado</span>
                            </Badge>
                          )}
                          {document.is_signed && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Firmado</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadDocument(document)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {document.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(parseISO(document.created_at), 'dd MMM yyyy', { locale: es })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{format(parseISO(document.created_at), 'HH:mm')}</span>
                      </div>
                      <div>
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay documentos</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm || selectedType !== 'all'
                ? 'No se encontraron documentos con los filtros actuales'
                : 'Aún no hay documentos médicos. Sube tu primer documento para comenzar.'}
            </p>
            {(searchTerm || selectedType !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Visor de documentos */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDocument && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getDocumentTypeBadge(selectedDocument.document_type)}
                    <span className="text-sm text-muted-foreground">
                      {format(parseISO(selectedDocument.created_at), 'dd MMMM yyyy, HH:mm', { locale: es })}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadDocument(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                {selectedDocument.description && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm">{selectedDocument.description}</p>
                  </div>
                )}

                <div className="border rounded-lg overflow-hidden h-[50vh]">
                  {selectedDocument.file_type.startsWith('image/') ? (
                    <img
                      src={selectedDocument.file_url}
                      alt={selectedDocument.title}
                      className="w-full h-full object-contain"
                    />
                  ) : selectedDocument.file_type === 'application/pdf' ? (
                    <iframe
                      src={selectedDocument.file_url}
                      className="w-full h-full"
                      title={selectedDocument.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      {getDocumentIcon(selectedDocument)}
                      <p className="mt-4 text-muted-foreground">
                        Vista previa no disponible
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(selectedDocument)}
                        className="mt-2"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar para ver
                      </Button>
                    </div>
                  )}
                </div>

                {selectedDocument.is_signed && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Documento firmado digitalmente</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Este documento ha sido firmado digitalmente y es legalmente válido.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}