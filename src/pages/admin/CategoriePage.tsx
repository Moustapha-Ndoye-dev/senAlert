import React, { useEffect, useState } from 'react';
import { categorieService, categorieOrganizationService, organizationService, Categorie, Organization } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Check, X, Plus, Users } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

const CategoriePage: React.FC = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [newCat, setNewCat] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Categorie | null>(null);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<Categorie | null>(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const cats = await categorieService.getAll();
      setCategories(cats);
      const orgs = await organizationService.getAll();
      setOrganizations(orgs);
      const assignObj: Record<string, string[]> = {};
      for (const cat of cats) {
        assignObj[cat.id] = await categorieOrganizationService.getOrganizationsByCategorie(cat.id);
      }
      setAssignments(assignObj);
    } catch {
      toast({ title: 'Erreur', description: 'Chargement impossible', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!newCat.trim()) return;
    try {
      await categorieService.create(newCat.trim());
      setNewCat('');
      toast({ title: 'Catégorie ajoutée' });
      await loadAll();
    } catch {
      toast({ title: 'Erreur', description: 'Ajout impossible', variant: 'destructive' });
    }
  };

  const handleEdit = async (id: string) => {
    try {
      await categorieService.update(id, editingValue.trim());
      setEditingId(null);
      setEditingValue('');
      toast({ title: 'Catégorie modifiée' });
      await loadAll();
    } catch {
      toast({ title: 'Erreur', description: 'Modification impossible', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await categorieService.delete(id);
      toast({ title: 'Catégorie supprimée' });
      await loadAll();
    } catch {
      toast({ title: 'Erreur', description: 'Suppression impossible', variant: 'destructive' });
    }
  };

  // --- Assignation ---
  const openAssignDialog = (cat: Categorie) => {
    setSelectedCat(cat);
    setSelectedOrgs(assignments[cat.id] || []);
    setAssignDialogOpen(true);
  };
  const handleToggleOrg = (orgId: string) => {
    setSelectedOrgs(prev => prev.includes(orgId)
      ? prev.filter(id => id !== orgId)
      : [...prev, orgId]);
  };
  const handleSaveAssign = async () => {
    if (!selectedCat) return;
    // Supprimer toutes les assignations puis réassigner celles sélectionnées
    const current = assignments[selectedCat.id] || [];
    const toRemove = current.filter(id => !selectedOrgs.includes(id));
    const toAdd = selectedOrgs.filter(id => !current.includes(id));
    await Promise.all([
      ...toRemove.map(orgId => categorieOrganizationService.unassign(selectedCat.id!, orgId)),
      ...toAdd.map(orgId => categorieOrganizationService.assign(selectedCat.id!, orgId)),
    ]);
    toast({ title: 'Assignations mises à jour' });
    setAssignDialogOpen(false);
    setSelectedCat(null);
    setSelectedOrgs([]);
    await loadAll();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Catégories</h1>
      <div className="flex gap-2 mb-8">
        <Input placeholder="Nouvelle catégorie" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <Button onClick={handleAdd} variant="default"><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
      </div>
      {loading ? <div>Chargement…</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold">Catégorie</th>
                <th className="p-3 text-left font-semibold">Organisations assignées</th>
                <th className="p-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-t">
                  <td className="p-3">
                    {editingId === cat.id ? (
                      <Input value={editingValue} onChange={e => setEditingValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEdit(cat.id)} autoFocus />
                    ) : (
                      <span className="text-lg font-semibold text-gray-800">{cat.nom}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {(assignments[cat.id] || []).map(orgId => {
                        const org = organizations.find(o => o.id === orgId);
                        return org ? (
                          <Badge key={org.id} variant="secondary" className="bg-blue-100 text-blue-800">
                            {org.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {editingId === cat.id ? (
                        <>
                          <Button size="sm" onClick={() => handleEdit(cat.id)} variant="default"><Check /></Button>
                          <Button size="sm" onClick={() => setEditingId(null)} variant="outline"><X /></Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(cat.id); setEditingValue(cat.nom); }}>Modifier</Button>
                          <AlertDialog open={deleteDialogOpen && catToDelete?.id === cat.id} onOpenChange={open => { setDeleteDialogOpen(open); if (!open) setCatToDelete(null); }}>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" onClick={() => { setCatToDelete(cat); setDeleteDialogOpen(true); }}>Supprimer</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Voulez-vous vraiment supprimer la catégorie <b>{cat.nom}</b> ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={async () => { await handleDelete(cat.id); setDeleteDialogOpen(false); setCatToDelete(null); }}>Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Dialog open={assignDialogOpen && selectedCat?.id === cat.id} onOpenChange={setAssignDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary" onClick={() => openAssignDialog(cat)}>Assigner</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assigner à des organisations</DialogTitle>
                              </DialogHeader>
                              <div className="flex gap-8">
                                {/* Liste des organisations à cocher */}
                                <div className="w-1/2 pr-4 border-r">
                                  <div className="mb-2 text-sm text-gray-500">Sélectionner les organisations :</div>
                                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                                    {organizations.map(org => (
                                      <label key={org.id} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={selectedOrgs.includes(org.id)} onChange={() => handleToggleOrg(org.id)} className="accent-blue-500" />
                                        <span>{org.name}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                {/* Tags organisations assignées */}
                                <div className="w-1/2 pl-4 flex flex-col gap-2">
                                  <div className="mb-2 text-sm text-gray-500">Organisations assignées :</div>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedOrgs.map(orgId => {
                                      const org = organizations.find(o => o.id === orgId);
                                      return org ? (
                                        <Badge key={org.id} variant="secondary" className="bg-blue-100 text-blue-800">
                                          {org.name}
                                          <Button size="icon" variant="ghost" className="ml-1 p-0" onClick={() => handleToggleOrg(org.id)}>
                                            ×
                                          </Button>
                                        </Badge>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 mt-6">
                                <DialogClose asChild>
                                  <Button variant="outline">Annuler</Button>
                                </DialogClose>
                                <Button variant="default" onClick={handleSaveAssign}>Enregistrer</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CategoriePage; 