import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Plus, X, Calendar as CalendarIcon, Clock, AlignLeft, Settings } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import CalendarSettingsModal, { type WeekDefinition } from './components/CalendarSettingsModal'

// Setup the localizer for Turkish
const locales = {
    'tr': tr,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})

interface ReservationEvent {
    id: number
    title: string
    start: Date
    end: Date
    desc?: string
    client?: string
}

// Sample initial data
const initialEvents: ReservationEvent[] = [
    {
        id: 1,
        title: 'Örnek Rezervasyon 1',
        start: new Date(2025, 10, 17, 9, 0), // Nov 17 2025
        end: new Date(2025, 10, 17, 10, 0),
        desc: 'Müşteri görüşmesi',
        client: 'ABC Şirketi'
    },
    {
        id: 2,
        title: 'Network Kurulumu',
        start: new Date(2025, 10, 18, 14, 0),
        end: new Date(2025, 10, 18, 16, 0),
        desc: 'Saha operasyonu',
        client: 'XYZ Ltd.'
    }
]

export default function CalendarPage() {
    const [events, setEvents] = useState<ReservationEvent[]>(initialEvents)
    const [view, setView] = useState('month')
    const [date, setDate] = useState(new Date(2025, 10, 17)) // Start around sample data

    // Settings Modal
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [weekDefinitions, setWeekDefinitions] = useState<WeekDefinition[]>([])

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null)
    const [newEventTitle, setNewEventTitle] = useState('')
    const [newEventClient, setNewEventClient] = useState('')
    const [newEventDesc, setNewEventDesc] = useState('')

    const onSelectSlot = useCallback(({ start, end }: { start: Date, end: Date }) => {
        setSelectedSlot({ start, end })
        setIsModalOpen(true)
    }, [])

    const handleSaveEvent = () => {
        if (!selectedSlot || !newEventTitle) return

        const newEvent: ReservationEvent = {
            id: Math.random(),
            title: newEventTitle,
            start: selectedSlot.start,
            end: selectedSlot.end,
            client: newEventClient,
            desc: newEventDesc
        }

        setEvents(prev => [...prev, newEvent])
        closeModal()
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedSlot(null)
        setNewEventTitle('')
        setNewEventClient('')
        setNewEventDesc('')
    }

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg text-white">
                            <CalendarIcon className="w-6 h-6" />
                        </div>
                        Rezervasyon Takvimi
                    </h1>
                    <p className="text-gray-500 mt-1">Haftalık rezervasyon ve müsaitlik yönetimi</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Ayarlar
                    </button>
                    <button
                        onClick={() => {
                            setSelectedSlot({
                                start: new Date(),
                                end: new Date(new Date().setHours(new Date().getHours() + 1))
                            })
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Yeni Rezervasyon
                    </button>
                </div>
            </div>

            {/* Calendar Component */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={['month', 'week', 'day', 'agenda']}
                    view={view as any}
                    date={date}
                    onView={setView}
                    onNavigate={setDate}
                    selectable
                    onSelectSlot={onSelectSlot}
                    onSelectEvent={(event: ReservationEvent) => alert(event.title)}
                    culture='tr'
                    messages={{
                        today: 'Bugün',
                        previous: 'Geri',
                        next: 'İleri',
                        month: 'Ay',
                        week: 'Hafta',
                        day: 'Gün',
                        agenda: 'Ajanda',
                        date: 'Tarih',
                        time: 'Zaman',
                        event: 'Etkinlik',
                        noEventsInRange: 'Bu aralıkta etkinlik yok.'
                    }}
                    eventPropGetter={(event: ReservationEvent) => ({
                        className: 'bg-primary-100 border-primary-200 text-primary-700 rounded-md px-2 text-sm font-medium border-l-4'
                    })}
                />
            </div>

            {/* Helper/Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-sm text-blue-800">
                <CalendarIcon className="w-5 h-5 flex-shrink-0" />
                <div>
                    <span className="font-semibold">Nasıl Kullanılır?</span>
                    <p className="mt-1">
                        Takvim üzerinde boş bir alana tıklayarak veya sürükleyerek yeni rezervasyon oluşturabilirsiniz.
                        Mevcut rezervasyonların detaylarını görmek için üzerine tıklayın.
                    </p>
                </div>
            </div>

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-slideDown">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-semibold text-lg text-gray-900">
                                Yeni Rezervasyon
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Başlık
                                </label>
                                <input
                                    type="text"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    placeholder="Rezervasyon başlığı..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Müşteri
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newEventClient}
                                        onChange={(e) => setNewEventClient(e.target.value)}
                                        placeholder="Müşteri adı..."
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Başlangıç
                                    </label>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        {selectedSlot && format(selectedSlot.start, 'dd.MM.yyyy HH:mm')}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bitiş
                                    </label>
                                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        {selectedSlot && format(selectedSlot.end, 'dd.MM.yyyy HH:mm')}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Açıklama
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={newEventDesc}
                                        onChange={(e) => setNewEventDesc(e.target.value)}
                                        placeholder="Ek notlar..."
                                        rows={3}
                                        className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                                    />
                                    <AlignLeft className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                disabled={!newEventTitle}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            <CalendarSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onSave={(newSettings) => {
                    setWeekDefinitions(newSettings)
                    console.log('Saved Settings:', newSettings)
                }}
            />
        </div>
    )
}
