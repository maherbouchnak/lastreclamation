'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertCircle, CheckCircle2, Edit, Trash2, Plus, HelpCircle, MessageCircle, Upload, FileText, Clock, User, Briefcase, MapPin, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image"

// Données fictives pour les agences
const agences = [
  { id: 1, nom: "Agence A" },
  { id: 2, nom: "Agence B" },
  { id: 3, nom: "Agence C" },
]

const tunisianStates = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja",
  "Jendouba", "Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan",
  "Kasserine", "Sidi Bouzid", "Gabès", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
]

const attijariAgencies = [
  { id: 1, name: "Agence Tunis Centre", state: "Tunis" },
  { id: 2, name: "Agence La Marsa", state: "Tunis" },
  { id: 3, name: "Agence Ariana Centre", state: "Ariana" },
  { id: 4, name: "Agence Sousse Ville", state: "Sousse" },
  { id: 5, name: "Agence Sfax Ville", state: "Sfax" },
]

type Reclamation = {
  id: number;
  nomClient: string;
  email: string;
  numeroCompte: string;
  typeReclamation: string;
  statut: string;
  dateSoumission: string;
  agenceId: number;
};

export function SystemeDeReclamation() {
  const [nomUtilisateur, setNomUtilisateur] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [roleUtilisateur, setRoleUtilisateur] = useState<'admin' | 'utilisateur' | null>(null)
  const [connexionEn, setConnexionEn] = useState<'admin' | 'utilisateur'>('utilisateur')

  // État administrateur
  const [reclamations, setReclamations] = useState<Reclamation[]>([
    { id: 1, nomClient: 'Jean Dupont', email: 'jean@exemple.com', numeroCompte: '1234567890123', typeReclamation: 'Litige de Transaction', statut: 'En attente', dateSoumission: '2024-03-15', agenceId: 1 },
    { id: 2, nomClient: 'Marie Martin', email: 'marie@exemple.com', numeroCompte: '9876543210987', typeReclamation: 'Plainte de Service', statut: 'En cours', dateSoumission: '2024-03-14', agenceId: 2 },
    { id: 3, nomClient: 'Pierre Durand', email: 'pierre@exemple.com', numeroCompte: '1357924680123', typeReclamation: 'Problème de Compte', statut: 'Résolu', dateSoumission: '2024-03-13', agenceId: 3 },
  ])
  const [reclamationSelectionnee, setReclamationSelectionnee] = useState<Reclamation | null>(null)
  const [estDialogueModificationOuvert, setEstDialogueModificationOuvert] = useState(false)
  const [estDialogueSuppressionOuvert, setEstDialogueSuppressionOuvert] = useState(false)
  const [estDialogueCreationOuvert, setEstDialogueCreationOuvert] = useState(false)
  const [requeteRecherche, setRequeteRecherche] = useState('')

  // État utilisateur
  const [etape, setEtape] = useState(1)
  const [progres, setProgres] = useState(25)
  const [typeCompte, setTypeCompte] = useState<'personnel' | 'entreprise'>('personnel')
  const [nouvelleReclamation, setNouvelleReclamation] = useState<Partial<Reclamation> & { description: string }>({
    nomClient: '',
    email: '',
    agenceId: 0,
    numeroCompte: '',
    typeReclamation: '',
    description: '',
  })
  const [fichierSelectionnes, setFichierSelectionnes] = useState<File[]>([])
  const refInputFichier = useRef<HTMLInputElement>(null)
  const [dateSuivi, setDateSuivi] = useState('')
  const [reclamationsUtilisateur, setReclamationsUtilisateur] = useState<Reclamation[]>([])

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [selectedReclamationForEmail, setSelectedReclamationForEmail] = useState<Reclamation | null>(null)

  const gererConnexion = (e: React.FormEvent) => {
    e.preventDefault()
    if (connexionEn === 'admin' && nomUtilisateur === 'admin' && motDePasse === 'admin') {
      setRoleUtilisateur('admin')
    } else if (connexionEn === 'utilisateur' && nomUtilisateur === 'utilisateur' && motDePasse === 'utilisateur') {
      setRoleUtilisateur('utilisateur')
      // Simuler la récupération des réclamations de l'utilisateur
      setReclamationsUtilisateur(reclamations.filter(r => r.email === 'jean@exemple.com'))
    } else {
      alert('Nom d\'utilisateur ou mot de passe invalide')
    }
  }

  const gererDeconnexion = () => {
    setRoleUtilisateur(null)
    setNomUtilisateur('')
    setMotDePasse('')
    setReclamationsUtilisateur([])
  }

  // Fonctions administrateur
  const gererModification = (reclamation: Reclamation) => {
    setReclamationSelectionnee(reclamation)
    setEstDialogueModificationOuvert(true)
  }

  const gererSuppression = (reclamation: Reclamation) => {
    setReclamationSelectionnee(reclamation)
    setEstDialogueSuppressionOuvert(true)
  }

  const confirmerSuppression = () => {
    if (reclamationSelectionnee) {
      setReclamations(reclamations.filter(r => r.id !== reclamationSelectionnee.id))
      setReclamationsUtilisateur(reclamationsUtilisateur.filter(r => r.id !== reclamationSelectionnee.id))
    }
    setEstDialogueSuppressionOuvert(false)
  }

  const gererCreation = (nouvelleReclamation: Partial<Reclamation>) => {
    const reclamationCreee: Reclamation = {
      id: Date.now(),
      nomClient: nouvelleReclamation.nomClient || '',
      email: nouvelleReclamation.email || '',
      numeroCompte: nouvelleReclamation.numeroCompte || '',
      typeReclamation: nouvelleReclamation.typeReclamation || '',
      statut: 'En attente',
      dateSoumission: new Date().toISOString().split('T')[0],
      agenceId: nouvelleReclamation.agenceId || 0,
    }
    setReclamations([reclamationCreee, ...reclamations])
    setEstDialogueCreationOuvert(false)
    setNouvelleReclamation({
      nomClient: '',
      email: '',
      agenceId: 0,
      numeroCompte: '',
      typeReclamation: '',
      description: '',
    })
  }

  const gererMiseAJour = (reclamationMiseAJour: Reclamation | null) => {
    if (reclamationMiseAJour) {
      const reclamationsMisesAJour = reclamations.map(r => r.id === reclamationMiseAJour.id ? reclamationMiseAJour : r)
      setReclamations(reclamationsMisesAJour)
      setReclamationsUtilisateur(reclamationsMisesAJour.filter(r => r.email === 'jean@exemple.com'))
      setEstDialogueModificationOuvert(false)
    }
  }

  // Fonctions utilisateur
  const gererEtapeSuivante = () => {
    setEtape(etapePrecedente => {
      const prochaineEtape = etapePrecedente + 1
      setProgres(prochaineEtape * 25)
      return prochaineEtape
    })
  }

  const gererEtapePrecedente = () => {
    setEtape(etapePrecedente => {
      const prochaineEtape = etapePrecedente - 1
      setProgres(prochaineEtape * 25)
      return prochaineEtape
    })
  }

  const gererSelectionFichier = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFichierSelectionnes(Array.from(e.target.files))
    }
  }

  const declencherInputFichier = () => {
    refInputFichier.current?.click()
  }

  const estBoutonSuivantDesactive = () => {
    if (etape === 2) {
      return !(nouvelleReclamation.numeroCompte?.length === 13 && nouvelleReclamation.agenceId !== 0)
    }
    return false
  }

  const gererSuiviStatut = () => {
    const reclamationsFiltrees = reclamationsUtilisateur.filter(r => 
      r.dateSoumission.includes(dateSuivi)
    )
    setReclamationsUtilisateur(reclamationsFiltrees)
  }

  const gererSoumissionReclamation = () => {
    const reclamationSoumise: Reclamation = {
      id: Date.now(),
      nomClient: nouvelleReclamation.nomClient || '',
      email: nouvelleReclamation.email || '',
      numeroCompte: nouvelleReclamation.numeroCompte || '',
      typeReclamation: nouvelleReclamation.typeReclamation || '',
      statut: 'En attente',
      dateSoumission: new Date().toISOString().split('T')[0],
      agenceId: nouvelleReclamation.agenceId || 0,
    }
    setReclamations([reclamationSoumise, ...reclamations])
    setReclamationsUtilisateur([reclamationSoumise, ...reclamationsUtilisateur])
    alert('Réclamation soumise avec succès !')
    setEtape(1)
    setProgres(25)
    setNouvelleReclamation({
      nomClient: '',
      email: '',
      agenceId: 0,
      numeroCompte: '',
      typeReclamation: '',
      description: '',
    })
    setFichierSelectionnes([])
  }

  const reclamationsFiltrees = reclamations.filter(reclamation =>
    reclamation.nomClient.toLowerCase().includes(requeteRecherche.toLowerCase())
  )

  const handleOpenEmailDialog = (reclamation: Reclamation) => {
    setSelectedReclamationForEmail(reclamation)
    setEmailSubject(`Mise à jour de votre réclamation #${reclamation.id}`)
    setEmailBody(`Cher/Chère ${reclamation.nomClient},\n\nNous vous informons que votre réclamation concernant "${reclamation.typeReclamation}" a été mise à jour. Le statut actuel de votre réclamation est "${reclamation.statut}".\n\nSi vous avez des questions, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe du service client`)
    setIsEmailDialogOpen(true)
  }

  const handleSendEmail = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedReclamationForEmail?.email,
          subject: emailSubject,
          body: emailBody,
          reclamation: selectedReclamationForEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setIsEmailDialogOpen(false);
      // Show success message
      alert('Email envoyé avec succès !');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-200 to-red-100 rounded-3xl overflow-hidden border border-orange-300">
      <nav className="bg-orange-600 text-white p-4 rounded-b-3xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="logo.png"
              alt="Banque Attijari Logo"
              width={40}
              height={40}
              className="rounded-full"
              priority
              onError={(e: any) => {
                console.error('Error loading image:', e);
                e.target.src = 'https://placehold.co/40x40?text=A'; // Fallback image
              }}
            />
            <span className="text-xl font-bold">Banque Attijari</span>
          </div>
          {roleUtilisateur && (
            <Button onClick={gererDeconnexion} variant="secondary" className="rounded-full bg-orange-600 text-white hover:bg-orange-700">Déconnexion</Button>
          )}
        </div>
      </nav>
      <main className="flex-grow p-4 md:p-8 flex">
        {!roleUtilisateur && (
          <Card className="w-96 mx-auto my-auto bg-gradient-to-br from-orange-100 to-red-50 border-orange-300">
            <CardHeader className="bg-orange-200 rounded-t-xl">
              <CardTitle className="text-2xl text-orange-800">Connexion</CardTitle>
              <CardDescription className="text-orange-700">Entrez vos identifiants pour accéder au système</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={gererConnexion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginAs" className="text-orange-800">Se connecter en tant que</Label>
                  <Select value={connexionEn} onValueChange={(value: 'admin' | 'utilisateur') => setConnexionEn(value)}>
                    <SelectTrigger id="loginAs" className="rounded-full border-orange-300">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrateur</SelectItem>
                      <SelectItem value="utilisateur">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-orange-800">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    value={nomUtilisateur}
                    onChange={(e) => setNomUtilisateur(e.target.value)}
                    required
                    className="rounded-full border-orange-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-orange-800">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    required
                    className="rounded-full border-orange-300"
                  />
                </div>
                <Button type="submit" className="w-full rounded-full bg-orange-600 text-white hover:bg-orange-700">Se connecter</Button>
              </form>
            </CardContent>
          </Card>
        )}
        {roleUtilisateur === 'admin' && (
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold mb-8 text-center text-orange-800">Tableau de Bord Administrateur des Réclamations</h1>
            <Card className="mb-8 rounded-3xl border border-orange-300 shadow-lg">
              <CardHeader className="bg-orange-100 rounded-t-3xl">
                <CardTitle className="text-2xl text-orange-800">Gérer les Réclamations</CardTitle>
                <CardDescription>Voir, modifier et gérer les réclamations des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <Input 
                    placeholder="Rechercher par nom de client..." 
                    className="max-w-sm rounded-full border-orange-300"
                    value={requeteRecherche}
                    onChange={(e) => setRequeteRecherche(e.target.value)}
                  />
                  <Button onClick={() => setEstDialogueCreationOuvert(true)} className="rounded-full bg-orange-600 text-white hover:bg-orange-700">
                    <Plus className="mr-2 h-4 w-4" /> Nouvelle Réclamation
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nom du Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Numéro de Compte</TableHead>
                      <TableHead>Type de Réclamation</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de Soumission</TableHead>
                      <TableHead>ID Agence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reclamationsFiltrees.map((reclamation) => (
                      <TableRow key={reclamation.id}>
                        <TableCell>{reclamation.id}</TableCell>
                        <TableCell>{reclamation.nomClient}</TableCell>
                        <TableCell>{reclamation.email}</TableCell>
                        <TableCell>{reclamation.numeroCompte}</TableCell>
                        <TableCell>{reclamation.typeReclamation}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            reclamation.statut === 'En attente' ? 'bg-yellow-200 text-yellow-800' :
                            reclamation.statut === 'En cours' ? 'bg-orange-300 text-orange-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {reclamation.statut}
                          </span>
                        </TableCell>
                        <TableCell>{reclamation.dateSoumission}</TableCell>
                        <TableCell>{reclamation.agenceId}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => gererModification(reclamation)} 
                              className="rounded-full"
                              disabled={reclamation.statut === 'Résolu'}
                            >
                              <Edit className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => gererSuppression(reclamation)} className="rounded-full">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEmailDialog(reclamation)} className="rounded-full">
                              <Mail className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
        {roleUtilisateur === 'utilisateur' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto max-w-5xl"
          >
            <h1 className="text-4xl font-bold mb-8 text-center text-orange-800">Centre de Réclamation</h1>
            <Tabs defaultValue="submit" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-orange-200 p-1">
                <TabsTrigger value="submit" className="rounded-full text-orange-800 data-[state=active]:bg-white">Soumettre une Réclamation</TabsTrigger>
                <TabsTrigger value="track" className="rounded-full text-orange-800 data-[state=active]:bg-white">Suivre le Statut</TabsTrigger>
                <TabsTrigger value="guide" className="rounded-full text-orange-800 data-[state=active]:bg-white">Guide</TabsTrigger>
              </TabsList>
              <TabsContent value="submit">
                <Card className="border border-orange-300 rounded-3xl shadow-lg">
                  <CardHeader className="bg-orange-100 rounded-t-3xl">
                    <CardTitle className="text-2xl text-orange-800">Soumettre une Nouvelle Réclamation</CardTitle>
                    <CardDescription>Veuillez fournir les détails de votre réclamation. Nous sommes là pour vous aider.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="mb-6">
                      <Progress value={progres} className="w-full h-2 bg-orange-200 rounded-full" />
                      <div className="flex justify-between mt-2 text-sm text-orange-700">
                        <span>Informations Personnelles</span>
                        <span>Détails du Compte</span>
                        <span>Informations de Réclamation</span>
                        <span>Révision</span>
                      </div>
                    </div>
                    {etape === 1 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-center space-x-4 mb-4">
                          <Button
                            variant={typeCompte === 'personnel' ? 'default' : 'outline'}
                            onClick={() => setTypeCompte('personnel')}
                            className="rounded-full"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Compte Personnel
                          </Button>
                          <Button
                            variant={typeCompte === 'entreprise' ? 'default' : 'outline'}
                            onClick={() => setTypeCompte('entreprise')}
                            className="rounded-full"
                          >
                            <Briefcase className="mr-2 h-4 w-4" />
                            Compte Entreprise
                          </Button>
                        </div>
                        {typeCompte === 'personnel' ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="firstName">Prénom</Label>
                                <Input 
                                  id="firstName" 
                                  placeholder="Jean" 
                                  className="rounded-full border-orange-300"
                                  value={nouvelleReclamation.nomClient?.split(' ')[0] || ''}
                                  onChange={(e) => setNouvelleReclamation({...nouvelleReclamation, nomClient: `${e.target.value} ${nouvelleReclamation.nomClient?.split(' ')[1] || ''}`})}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="lastName">Nom</Label>
                                <Input 
                                  id="lastName" 
                                  placeholder="Dupont" 
                                  className="rounded-full border-orange-300"
                                  value={nouvelleReclamation.nomClient?.split(' ')[1] || ''}
                                  onChange={(e) => setNouvelleReclamation({...nouvelleReclamation, nomClient: `${nouvelleReclamation.nomClient?.split(' ')[0] || ''} ${e.target.value}`})}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sex">Sexe</Label>
                              <Select>
                                <SelectTrigger id="sex" className="rounded-full border-orange-300">
                                  <SelectValue placeholder="Sélectionner le sexe" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Homme</SelectItem>
                                  <SelectItem value="female">Femme</SelectItem>
                                  <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Nom Complet</Label>
                              <Input 
                                id="fullName" 
                                placeholder="Jean Dupont" 
                                className="rounded-full border-orange-300"
                                value={nouvelleReclamation.nomClient}
                                onChange={(e) => setNouvelleReclamation({...nouvelleReclamation, nomClient: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tradeName">Nom Commercial</Label>
                              <Input id="tradeName" placeholder="Entreprise SA" className="rounded-full border-orange-300" />
                            </div>
                          </>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            placeholder="jean.dupont@exemple.com" 
                            type="email" 
                            className="rounded-full border-orange-300"
                            value={nouvelleReclamation.email}
                            onChange={(e) => setNouvelleReclamation({...nouvelleReclamation, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Numéro de Téléphone</Label>
                          <Input id="phone" placeholder="+33 6 12 34 56 78" type="tel" className="rounded-full border-orange-300" />
                        </div>
                      </motion.div>
                    )}
                    {etape === 2 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">Numéro de Compte</Label>
                          <Input 
                            id="accountNumber" 
                            placeholder="Entrez votre numéro de compte à 13 chiffres" 
                            className="rounded-full border-orange-300"
                            value={nouvelleReclamation.numeroCompte}
                            onChange={(e) => setNouvelleReclamation({...nouvelleReclamation, numeroCompte: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agencyId">Agence</Label>
                          <div className="flex items-center space-x-2">
                            <Select onValueChange={(value) => setNouvelleReclamation({...nouvelleReclamation, agenceId: parseInt(value)})}>
                              <SelectTrigger id="agencyId" className="rounded-full border-orange-300 flex-grow">
                                <SelectValue placeholder="Sélectionner une agence" />
                              </SelectTrigger>
                              <SelectContent>
                                {attijariAgencies.map((agence) => (
                                  <SelectItem key={agence.id} value={agence.id.toString()}>{agence.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full">
                                  <MapPin className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Rechercher un état..." />
                                  <CommandList>
                                    <CommandEmpty>Aucun état trouvé.</CommandEmpty>
                                    <CommandGroup heading="États">
                                      {tunisianStates.map((state) => (
                                        <CommandItem
                                          key={state}
                                          onSelect={() => {
                                            const filteredAgencies = attijariAgencies.filter(agency => agency.state === state);
                                            setNouvelleReclamation({...nouvelleReclamation, agenceId: filteredAgencies[0]?.id || 0})
                                          }}
                                        >
                                          {state}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {etape === 3 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="claimType">Type de Réclamation</Label>
                          <Select onValueChange={(value) => setNouvelleReclamation({...nouvelleReclamation, typeReclamation: value})}>
                            <SelectTrigger id="claimType" className="rounded-full border-orange-300">
                              <SelectValue placeholder="Sélectionner le type de réclamation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="transaction">Litige de Transaction</SelectItem>
                              <SelectItem value="service">Plainte de Service</SelectItem>
                              <SelectItem value="account">Problème de Compte</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea 
                            id="description" 
                            placeholder="Veuillez fournir les détails de votre réclamation..." 
                            className="rounded-xl border-orange-300"
                            value={nouvelleReclamation.description}
                            onChange={(e) => setNouvelleReclamation({...nouvelleReclamation, description: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fileUpload">Télécharger des Fichiers</Label>
                          <input
                            type="file"
                            id="fileUpload"
                            multiple
                            onChange={gererSelectionFichier}
                            className="hidden"
                            ref={refInputFichier}
                          />
                          <Button onClick={declencherInputFichier} className="w-full rounded-full bg-orange-600 text-white hover:bg-orange-700">
                            <Upload className="mr-2 h-4 w-4" />
                            Sélectionner des Fichiers
                          </Button>
                          {fichierSelectionnes.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-orange-700">Fichiers sélectionnés :</p>
                              <ul className="list-disc list-inside">
                                {fichierSelectionnes.map((fichier, index) => (
                                  <li key={index} className="text-sm text-orange-600">{fichier.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {etape === 4 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        <h3 className="text-xl font-semibold text-orange-800">Révision de Votre Soumission</h3>
                        <p className="text-orange-700">Veuillez vérifier les informations que vous avez fournies. Si tout est correct, vous pouvez soumettre votre réclamation.</p>
                        <div className="p-4 bg-orange-300 rounded-lg border border-orange-400">
                          <p><strong>Type de Compte :</strong> {typeCompte === 'personnel' ? 'Compte Personnel' : 'Compte Entreprise'}</p>
                          <p><strong>Nom :</strong> {nouvelleReclamation.nomClient}</p>
                          <p><strong>Email :</strong> {nouvelleReclamation.email}</p>
                          <p><strong>Numéro de Compte :</strong> {nouvelleReclamation.numeroCompte}</p>
                          <p><strong>Agence :</strong> {attijariAgencies.find(a => a.id === nouvelleReclamation.agenceId)?.name}</p>
                          <p><strong>Type de Réclamation :</strong> {nouvelleReclamation.typeReclamation}</p>
                          <p><strong>Description :</strong> {nouvelleReclamation.description}</p>
                          <p><strong>Fichiers Téléchargés :</strong> {fichierSelectionnes.length} fichier(s)</p>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between bg-orange-100 rounded-b-3xl">
                    {etape > 1 && (
                      <Button variant="outline" onClick={gererEtapePrecedente} className="rounded-full border-orange-600 text-orange-600 hover:bg-orange-200">Précédent</Button>
                    )}
                    {etape < 4 ? (
                      <Button 
                        onClick={gererEtapeSuivante} 
                        className="rounded-full bg-orange-600 text-white hover:bg-orange-700"
                        disabled={estBoutonSuivantDesactive()}
                      >
                        Suivant
                      </Button>
                    ) : (
                      <Button onClick={gererSoumissionReclamation} className="rounded-full bg-green-500 text-white hover:bg-green-600">Soumettre la Réclamation</Button>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="track">
                <Card className="border border-red-300 rounded-3xl shadow-lg">
                  <CardHeader className="bg-red-50 rounded-t-3xl">
                    <CardTitle className="text-2xl text-red-800">Suivre Vos Réclamations</CardTitle>
                    <CardDescription>Consultez et gérez vos réclamations récentes.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input 
                          type="date"
                          placeholder="Rechercher par date" 
                          className="rounded-full border-red-300"
                          value={dateSuivi}
                          onChange={(e) => setDateSuivi(e.target.value)}
                        />
                        <Button 
                          className="rounded-full bg-red-500 text-white hover:bg-red-600"
                          onClick={gererSuiviStatut}
                        >
                          Rechercher
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Type de Réclamation</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date de Soumission</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reclamationsUtilisateur.map((reclamation) => (
                            <TableRow key={reclamation.id}>
                              <TableCell>{reclamation.id}</TableCell>
                              <TableCell>{reclamation.typeReclamation}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  reclamation.statut === 'En attente' ? 'bg-yellow-200 text-yellow-800' :
                                  reclamation.statut === 'En cours' ? 'bg-orange-300 text-orange-800' :
                                  'bg-green-200 text-green-800'
                                }`}>
                                  {reclamation.statut}
                                </span>
                              </TableCell>
                              <TableCell>{reclamation.dateSoumission}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => gererModification(reclamation)} 
                                  className="rounded-full"
                                  disabled={reclamation.statut === 'Résolu'}
                                >
                                  <Edit className="h-4 w-4 text-orange-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => gererSuppression(reclamation)} 
                                  className="rounded-full"
                                  disabled={reclamation.statut === 'Résolu'}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="guide">
                <Card className="border border-orange-300 rounded-3xl shadow-lg">
                  <CardHeader className="bg-orange-100 rounded-t-3xl">
                    <CardTitle className="text-2xl text-orange-800">Guide des Réclamations</CardTitle>
                    <CardDescription>Apprenez comment soumettre une réclamation valide et ce à quoi vous attendre pendant le processus.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <FileText className="w-6 h-6 text-orange-700 mt-1" />
                        <div>
                          <h3 className="font-semibold text-orange-800">Préparez Vos Informations</h3>
                          <p className="text-orange-700">Rassemblez tous les documents pertinents, les détails des transactions et les informations de compte avant de commencer votre réclamation.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <CheckCircle2 className="w-6 h-6 text-orange-700 mt-1" />
                        <div>
                          <h3 className="font-semibold text-orange-800">Soyez Précis et Exact</h3>
                          <p className="text-orange-700">Fournissez des détails clairs et concis sur votre problème. Incluez les dates, les montants et toute communication pertinente que vous avez eue avec la banque.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Clock className="w-6 h-6 text-orange-700 mt-1" />
                        <div>
                          <h3 className="font-semibold text-orange-800">Soumettez en Temps Opportun</h3>
                          <p className="text-orange-700">Déposez votre réclamation dès que possible après avoir découvert le problème. Il peut y avoir des délais pour certains types de réclamations.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <User className="w-6 h-6 text-orange-700 mt-1" />
                        <div>
                          <h3 className="font-semibold text-orange-800">Restez Engagé</h3>
                          <p className="text-orange-700">Suivez le statut de votre réclamation et répondez rapidement à toute demande d'informations supplémentaires.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Envoyer un Email au Client</DialogTitle>
            <DialogDescription>
              Envoyez un email à {selectedReclamationForEmail?.nomClient} concernant sa réclamation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailTo" className="text-right">
                À
              </Label>
              <Input
                id="emailTo"
                value={selectedReclamationForEmail?.email || ''}
                className="col-span-3 rounded-full border-orange-300"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailSubject" className="text-right">
                Sujet
              </Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="col-span-3 rounded-full border-orange-300"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emailBody" className="text-right">
                Message
              </Label>
              <Textarea
                id="emailBody"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="col-span-3 rounded-xl border-orange-300"
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEmailDialogOpen(false)} className="rounded-full">
              Annuler
            </Button>
            <Button type="button" onClick={handleSendEmail} className="rounded-full bg-orange-600 text-white hover:bg-orange-700">
              Envoyer l'Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}