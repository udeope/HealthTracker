'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Slider } from '@/components/ui/slider';
import {
  Search,
  Star,
  MapPin,
  Clock,
  Video,
  MessageCircle,
  Phone,
  Filter,
  Calendar,
  Award,
  Languages,
  GraduationCap
} from 'lucide-react';
import { TelemedicineService, type Doctor, type DoctorFilters } from '@/lib/telemedicine-system';

interface DoctorListProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

const SPECIALTIES = [
  'Cardiología', 'Neurología', 'Dermatología', 'Pediatría', 'Ginecología',
  'Psiquiatría', 'Medicina General', 'Endocrinología', 'Traumatología', 'Oftalmología'
];

const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués'];

export function DoctorList({ onSelectDoctor }: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState<DoctorFilters>({
    specialty: '',
    min_rating: 0,
    max_fee: 200,
    available_today: false,
    languages: []
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [doctors, searchTerm, filters]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await TelemedicineService.getDoctors();
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...doctors];

    // Filtro de búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.sub_specialties.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Aplicar filtros adicionales
    const filteredByFilters = await TelemedicineService.getDoctors(filters);
    const filteredIds = new Set(filteredByFilters.map(d => d.id));
    filtered = filtered.filter(doctor => filteredIds.has(doctor.id));

    setFilteredDoctors(filtered);
  };

  const handleFilterChange = (key: keyof DoctorFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      min_rating: 0,
      max_fee: 200,
      available_today: false,
      languages: []
    });
    setSearchTerm('');
  };

  const openDoctorProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsProfileOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Filtrar Doctores</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Especialidad</label>
                  <Select value={filters.specialty} onValueChange={(value) => handleFilterChange('specialty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las especialidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las especialidades</SelectItem>
                      {SPECIALTIES.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Calificación mínima: {filters.min_rating}/5
                  </label>
                  <Slider
                    value={[filters.min_rating || 0]}
                    onValueChange={(value) => handleFilterChange('min_rating', value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tarifa máxima: €{filters.max_fee}
                  </label>
                  <Slider
                    value={[filters.max_fee || 200]}
                    onValueChange={(value) => handleFilterChange('max_fee', value[0])}
                    max={300}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available_today"
                    checked={filters.available_today}
                    onChange={(e) => handleFilterChange('available_today', e.target.checked)}
                  />
                  <label htmlFor="available_today" className="text-sm">Disponible hoy</label>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={clearFilters} variant="outline" className="flex-1">
                    Limpiar
                  </Button>
                  <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
                    Aplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-sm text-muted-foreground">
          {filteredDoctors.length} doctor(es) encontrado(s)
        </div>
      </div>

      {/* Lista de doctores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={doctor.profile_image} alt={`${doctor.first_name} ${doctor.last_name}`} />
                  <AvatarFallback className="text-lg">
                    {doctor.first_name[0]}{doctor.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {doctor.first_name} {doctor.last_name}
                  </h3>
                  <p className="text-primary font-medium">{doctor.specialty}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars(doctor.rating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {doctor.rating} ({doctor.total_reviews} reseñas)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Award className="w-4 h-4" />
                <span>{doctor.years_experience} años de experiencia</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Languages className="w-4 h-4" />
                <span>{doctor.languages.slice(0, 2).join(', ')}</span>
                {doctor.languages.length > 2 && (
                  <span>+{doctor.languages.length - 2} más</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {doctor.is_available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">€{doctor.consultation_fee}</p>
                  <p className="text-xs text-muted-foreground">por consulta</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {doctor.biography}
              </p>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDoctorProfile(doctor)}
                  className="flex-1"
                >
                  Ver Perfil
                </Button>
                <Button
                  size="sm"
                  onClick={() => onSelectDoctor(doctor)}
                  className="flex-1"
                  disabled={!doctor.is_available}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar
                </Button>
              </div>

              <div className="flex justify-center space-x-4 pt-2 border-t">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span>Video</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>Llamada</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de perfil del doctor */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDoctor && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedDoctor.profile_image} />
                    <AvatarFallback className="text-xl">
                      {selectedDoctor.first_name[0]}{selectedDoctor.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">
                      {selectedDoctor.first_name} {selectedDoctor.last_name}
                    </DialogTitle>
                    <p className="text-primary font-medium text-lg">{selectedDoctor.specialty}</p>
                    <div className="flex items-center space-x-1 mt-2">
                      {renderStars(selectedDoctor.rating)}
                      <span className="text-sm text-muted-foreground ml-2">
                        {selectedDoctor.rating} ({selectedDoctor.total_reviews} reseñas)
                      </span>
                    </div>
                    {selectedDoctor.is_verified && (
                      <Badge variant="secondary" className="mt-2">
                        <Award className="w-3 h-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Información Profesional</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experiencia:</span>
                      <span>{selectedDoctor.years_experience} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Licencia:</span>
                      <span>{selectedDoctor.medical_license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Consultas:</span>
                      <span>{selectedDoctor.total_consultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tarifa:</span>
                      <span className="font-medium">€{selectedDoctor.consultation_fee}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Idiomas</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.languages.map((language) => (
                      <Badge key={language} variant="outline">{language}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Subespecialidades</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.sub_specialties.map((subspecialty) => (
                    <Badge key={subspecialty} variant="secondary">{subspecialty}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Educación</h4>
                <div className="space-y-3">
                  {selectedDoctor.education.map((edu, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <GraduationCap className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution} • {edu.year} • {edu.country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Certificaciones</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDoctor.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">{cert}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Biografía</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedDoctor.biography}
                </p>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    onSelectDoctor(selectedDoctor);
                    setIsProfileOpen(false);
                  }}
                  className="flex-1"
                  disabled={!selectedDoctor.is_available}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Consulta
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}