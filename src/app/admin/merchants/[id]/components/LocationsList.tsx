import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Phone, Mail } from 'lucide-react'

type Location = {
  id: string
  name: string
  address: string
  postalCode: string
  city: string
  phone: string
  email: string | null
  logoUrl: string | null
  bannerUrl: string | null
  status: 'coming_soon' | 'active' | 'temporarily_closed' | 'closed'
  createdAt: Date | string
  updatedAt: Date | string
}

type LocationsListProps = {
  locations: Location[]
  totalLocations: number
}

export function LocationsList({ locations, totalLocations }: LocationsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
        <CardDescription>
          {locations.length === 0
            ? 'No locations found'
            : `${locations.length} location${locations.length === 1 ? '' : 's'}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {locations.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No locations have been added yet.
          </div>
        ) : (
          <div className="space-y-4">
            {locations.map((location) => {
              // Format address for display
              const addressParts = [
                location.address,
                location.city,
                location.postalCode,
              ].filter(Boolean)
              const fullAddress = addressParts.join(', ')
              
              return (
                <div key={location.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{location.name}</h3>
                        <Badge variant="outline" className="capitalize text-xs">
                          {location.status}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-sm md:grid-cols-2">
                        {fullAddress && (
                          <div className="flex items-start gap-2">
                            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                            <div className="text-muted-foreground">{fullAddress}</div>
                          </div>
                        )}
                        {location.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="text-muted-foreground size-4 shrink-0" />
                            <a href={`tel:${location.phone}`} className="hover:underline">
                              {location.phone}
                            </a>
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="text-muted-foreground size-4 shrink-0" />
                            <a href={`mailto:${location.email}`} className="hover:underline">
                              {location.email}
                            </a>
                          </div>
                        )}
                      </div>
                      {(location.logoUrl || location.bannerUrl) && (
                        <div className="flex gap-4 pt-2">
                          {location.logoUrl && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Logo</div>
                              <div className="relative h-16 w-16">
                                <Image
                                  src={location.logoUrl}
                                  alt={`${location.name} logo`}
                                  fill
                                  className="rounded object-cover"
                                  unoptimized={location.logoUrl.startsWith('data:')}
                                />
                              </div>
                            </div>
                          )}
                          {location.bannerUrl && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Banner</div>
                              <img
                                src={location.bannerUrl}
                                alt={`${location.name} banner`}
                                className="h-16 w-32 rounded object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
