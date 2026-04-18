"use client"

import { useState } from "react"
import { Save, Building2, Ticket, DollarSign, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfiguracionPage() {
  return (
    <div className="p-6 lg:p-10 space-y-8 bg-[#f8f9fa] min-h-full">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-black italic uppercase">Configuración <span className="text-primary">de Marca</span></h1>
        <p className="text-muted-foreground">Personaliza Punto Ferretero para tu negocio.</p>
      </div>

      <Tabs defaultValue="negocio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mb-8 bg-black p-1 h-14 rounded-xl">
          <TabsTrigger value="negocio" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-white font-bold">Datos del Negocio</TabsTrigger>
          <TabsTrigger value="ticket" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-white font-bold">Ticket y Ventas</TabsTrigger>
          <TabsTrigger value="impuestos" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black text-white font-bold">Finanzas</TabsTrigger>
        </TabsList>

        <TabsContent value="negocio">
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="bg-muted/30 pb-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Building2 className="w-8 h-8 text-primary" />
                Información Comercial
              </CardTitle>
              <CardDescription className="font-medium">Estos datos aparecerán en la cabecera de tus tickets de Punto Ferretero.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="businessName" className="font-bold text-black uppercase text-xs tracking-widest">Nombre del Negocio</Label>
                  <Input id="businessName" placeholder="Punto Ferretero" defaultValue="Punto Ferretero" className="h-12 border-2 focus:border-primary" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="font-bold text-black uppercase text-xs tracking-widest">Teléfono de Contacto</Label>
                  <Input id="phone" placeholder="55-1234-5678" defaultValue="55-1234-5678" className="h-12 border-2 focus:border-primary" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="address" className="font-bold text-black uppercase text-xs tracking-widest">Dirección Completa</Label>
                  <Textarea id="address" placeholder="Av. Principal #123, Col. Centro, CP 12345, CDMX" defaultValue="Av. Principal #123, Col. Centro, CP 12345, CDMX" className="min-h-[100px] border-2 focus:border-primary" />
                </div>
                <div className="space-y-4">
                  <Label className="font-bold text-black uppercase text-xs tracking-widest">Logo del Negocio</Label>
                  <div className="border-4 border-dashed border-muted rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-[#fcfcfc] hover:bg-primary/5 transition-colors cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm font-bold text-muted-foreground uppercase">Arrastra tu logo aquí</p>
                    <Button variant="outline" size="sm" className="font-bold border-black">Seleccionar Imagen</Button>
                  </div>
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-black font-black w-full md:w-auto px-10 h-14 rounded-xl shadow-lg shadow-primary/20">
                <Save className="w-5 h-5 mr-3" /> GUARDAR CAMBIOS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ticket">
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="bg-muted/30 pb-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <Ticket className="w-8 h-8 text-primary" />
                Personalización de Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="nextFolio" className="font-bold text-black uppercase text-xs tracking-widest">Siguiente Folio de Venta</Label>
                  <Input id="nextFolio" type="number" defaultValue="1" className="h-12 border-2 focus:border-primary" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="ticketMessage" className="font-bold text-black uppercase text-xs tracking-widest">Mensaje al Final del Ticket</Label>
                  <Textarea 
                    id="ticketMessage" 
                    placeholder="Gracias por su compra." 
                    defaultValue="Gracias por su compra en Punto Ferretero. ¡Vuelva pronto!" 
                    className="min-h-[100px] border-2 focus:border-primary"
                  />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-black font-black w-full md:w-auto px-10 h-14 rounded-xl">
                <Save className="w-5 h-5 mr-3" /> GUARDAR CONFIGURACIÓN
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impuestos">
          <Card className="border-none shadow-xl bg-white">
            <CardHeader className="bg-muted/30 pb-8">
              <CardTitle className="flex items-center gap-3 text-2xl font-black">
                <DollarSign className="w-8 h-8 text-primary" />
                Impuestos y Divisa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="taxRate" className="font-bold text-black uppercase text-xs tracking-widest">IVA (%)</Label>
                  <Input id="taxRate" type="number" defaultValue="16" className="h-12 border-2 focus:border-primary" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="currency" className="font-bold text-black uppercase text-xs tracking-widest">Moneda</Label>
                  <Input id="currency" defaultValue="MXN (Pesos Mexicanos)" disabled className="h-12 bg-muted/50 font-bold" />
                </div>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-black font-black w-full md:w-auto px-10 h-14 rounded-xl">
                <Save className="w-5 h-5 mr-3" /> ACTUALIZAR FINANZAS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}