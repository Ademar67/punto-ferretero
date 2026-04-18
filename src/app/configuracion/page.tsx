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
    <div className="p-6 lg:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Personaliza los datos de tu negocio y el formato de tus tickets.</p>
      </div>

      <Tabs defaultValue="negocio" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="negocio">Datos del Negocio</TabsTrigger>
          <TabsTrigger value="ticket">Ticket y Ventas</TabsTrigger>
          <TabsTrigger value="impuestos">Impuestos / Moneda</TabsTrigger>
        </TabsList>

        <TabsContent value="negocio">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Información Comercial
              </CardTitle>
              <CardDescription>Estos datos aparecerán en la cabecera de tus tickets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input id="businessName" placeholder="Ferretería El Martillo" defaultValue="Ferretería El Martillo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono de Contacto</Label>
                  <Input id="phone" placeholder="55-1234-5678" defaultValue="55-1234-5678" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Dirección Completa</Label>
                  <Textarea id="address" placeholder="Av. Principal #123, Col. Centro, CP 12345, CDMX" defaultValue="Av. Principal #123, Col. Centro, CP 12345, CDMX" />
                </div>
                <div className="space-y-4">
                  <Label>Logo del Negocio</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-muted/30">
                    <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    <Button variant="outline" size="sm">Seleccionar Imagen</Button>
                  </div>
                </div>
              </div>
              <Button className="bg-primary text-white">
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ticket">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Personalización de Ticket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nextFolio">Siguiente Folio de Venta</Label>
                  <Input id="nextFolio" type="number" defaultValue="1" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="ticketMessage">Mensaje al Final del Ticket</Label>
                  <Textarea 
                    id="ticketMessage" 
                    placeholder="Gracias por su compra. ¡Vuelva pronto!" 
                    defaultValue="Gracias por su compra. ¡Vuelva pronto! No se aceptan devoluciones después de 30 días." 
                  />
                </div>
              </div>
              <Button className="bg-primary text-white">
                <Save className="w-4 h-4 mr-2" /> Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impuestos">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Impuestos y Divisa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">IVA (%)</Label>
                  <Input id="taxRate" type="number" defaultValue="16" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" defaultValue="MXN (Pesos Mexicanos)" disabled />
                </div>
              </div>
              <Button className="bg-primary text-white">
                <Save className="w-4 h-4 mr-2" /> Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
