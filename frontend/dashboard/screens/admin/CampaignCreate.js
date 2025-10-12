//CITS3200 project group 23 2024
//Admin campaign creation UI (target selection, schedule, message)

import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Alert, ScrollView } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import COLORS from '../../../constants/colors'
import FONTS from '../../../constants/fonts'
import { auth } from '../../../firebase/config'
import { ChevronBackOutline } from 'react-ionicons';
import PillButton from '../../../components/Buttons/PillButton';

//TODO: we can use react-datepicker for web, but need to downloard package from npm

const CampaignCreate = ({ navigation }) => {
  const [message, setMessage] = useState('')
  const [targetMode, setTargetMode] = useState('all') // 'all' | 'emails'
  const [emailsCsv, setEmailsCsv] = useState('')
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 60 * 60 * 1000))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [sendNow, setSendNow] = useState(false)

  const DEFAULT_TZ = 'Australia/Perth'
  const timezone = useMemo(() => DEFAULT_TZ, [])

  const onChangeDate = (_, date) => {
    setShowDatePicker(false)
    if (date) {
      const next = new Date(scheduledAt)
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setScheduledAt(next)
    }
  }

  const onChangeTime = (_, date) => {
    setShowTimePicker(false)
    if (date) {
      const next = new Date(scheduledAt)
      next.setHours(date.getHours(), date.getMinutes(), 0, 0)
      setScheduledAt(next)
    }
  }



  const openDatePicker = () => {
    if (Platform.OS === 'web') {
      const current = scheduledAt
      const iso = current.toISOString().slice(0, 10) // YYYY-MM-DD
      // eslint-disable-next-line no-undef
      const input = window.prompt('Select date (YYYY-MM-DD) [AWST]', iso)
      if (input) {
        const parts = input.split('-').map(p => parseInt(p, 10))
        if (parts.length === 3 && !parts.some(isNaN)) {
          const next = new Date(scheduledAt)
          next.setFullYear(parts[0], parts[1] - 1, parts[2])
          setScheduledAt(next)
        } else {
          Alert.alert('Invalid date format')
        }
      }
    } else {
      setShowDatePicker(true)
    }
  }

  const openTimePicker = () => {
    if (Platform.OS === 'web') {
      const current = scheduledAt
      const hh = String(current.getHours()).padStart(2, '0')
      const mm = String(current.getMinutes()).padStart(2, '0')
      // eslint-disable-next-line no-undef
      const input = window.prompt('Select time (HH:MM, 24h) [AWST]', `${hh}:${mm}`)
      if (input) {
        const parts = input.split(':').map(p => parseInt(p, 10))
        if (parts.length === 2 && parts[0] >= 0 && parts[0] < 24 && parts[1] >= 0 && parts[1] < 60) {
          const next = new Date(scheduledAt)
          next.setHours(parts[0], parts[1], 0, 0)
          setScheduledAt(next)
        } else {
          Alert.alert('Invalid time format')
        }
      }
    } else {
      setShowTimePicker(true)
    }
  }

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Validation', 'Please enter a message.')
      return
    }
    if (targetMode === 'emails' && !emailsCsv.trim()) {
      Alert.alert('Validation', 'Please enter at least one email, comma-separated.')
      return
    }
    if (!sendNow && scheduledAt.getTime() < Date.now() + 60 * 1000) {
      Alert.alert('Validation', 'Please select a time at least 1 minute in the future.')
      return
    }

    let base = process.env.EXPO_PUBLIC_BACKEND_URL
    if (!base) {
      if (Platform.OS === 'web') window.alert('Not configured: EXPO_PUBLIC_BACKEND_URL missing')
      else Alert.alert('Not configured', 'Backend URL is not set. Define EXPO_PUBLIC_BACKEND_URL.')
      return
    }
    // strip quotes if present and ensure protocol is included
    base = String(base).replace(/^"|"$/g, '')
    if (!/^https?:\/\//i.test(base)) base = `http://${base}`
    base = base.replace(/\/$/, '')

    const emails = emailsCsv
      .split(',')
      .map(e => e.trim())
      .filter(Boolean)

    const payload = {
      message: message.trim(),
      // If sendNow is selected, set scheduled time to now so server will send immediately.
      scheduledAtUtc: (sendNow ? new Date() : scheduledAt).toISOString(),
      timezone,
      target: targetMode === 'all' ? { type: 'all' } : { type: 'emails', emails },
    }

    try {
      console.debug('[campaign] submitting', { base, payload })
      const token = await auth?.currentUser?.getIdToken?.()
      console.debug('[campaign] idToken present?', !!token)
      const url = `${base}/admin/campaigns`
      console.debug('[campaign] POST', url)
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      console.debug('[campaign] response status', res.status)
      const text = await res.text()
      console.debug('[campaign] response body', text)
      if (res.ok) {
        if (Platform.OS === 'web') window.alert('Scheduled: Campaign has been scheduled.')
        else Alert.alert('Scheduled', 'Campaign has been scheduled.')
        navigation.goBack()
      } else {
        if (Platform.OS === 'web') window.alert('Error scheduling campaign: ' + (text || res.status))
        else Alert.alert('Error', text || 'Failed to schedule')
      }
    } catch (e) {
      console.error('[campaign] submit exception', e)
      if (Platform.OS === 'web') window.alert('Error scheduling campaign: ' + String(e))
      else Alert.alert('Error', Platform.OS === 'web' ? String(e) : 'Failed to schedule')
    }
  }

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronBackOutline color={COLORS.black} height="28px" width="28px" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.header}>Create Campaign</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Target selection */}
        <Text style={styles.label}>Target</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.toggle, targetMode === 'all' && styles.toggleActive]}
            onPress={() => setTargetMode('all')}
          >
            <Text style={[styles.toggleText, targetMode === 'all' && styles.toggleTextActive]}>All users</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, targetMode === 'emails' && styles.toggleActive]}
            onPress={() => setTargetMode('emails')}
          >
            <Text style={[styles.toggleText, targetMode === 'emails' && styles.toggleTextActive]}>Specific emails</Text>
          </TouchableOpacity>
        </View>

        {targetMode === 'emails' && (
          <TextInput
            style={styles.input}
            placeholder="email1@example.com, email2@example.com"
            placeholderTextColor={COLORS.grey}
            value={emailsCsv}
            onChangeText={setEmailsCsv}
            autoCapitalize='none'
          />
        )}

        {/* Schedule */}
        <Text style={styles.label}>Schedule</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <TouchableOpacity
            style={[styles.toggle, sendNow && styles.toggleActive]}
            onPress={() => setSendNow(!sendNow)}
          >
            <Text style={[styles.toggleText, sendNow && styles.toggleTextActive]}>{sendNow ? 'Send now' : 'Send later'}</Text>
          </TouchableOpacity>
          <Text style={[styles.caption, { marginLeft: 12 }]}>When "Send now" is selected the campaign will be sent immediately.</Text>
        </View>
        <Text style={styles.caption}>Timezone: {timezone} (AWST)</Text>
        <View style={styles.row}>
          <PillButton
            title={scheduledAt.toLocaleDateString('en-AU', { timeZone: timezone })}
            onPress={openDatePicker}
            variant="neutral"
            style={styles.smallPill}
            disabled={sendNow}
          />
          <PillButton
            title={scheduledAt.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone })}
            onPress={openTimePicker}
            variant="neutral"
            style={styles.smallPill}
            disabled={sendNow}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledAt}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={scheduledAt}
            mode="time"
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}

        {/* Message */}
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notification message"
          placeholderTextColor={COLORS.grey}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        {/* Actions */}
        <PillButton
          title="Schedule"
          onPress={handleSubmit}
          variant="neutral"
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    fontSize: 30,
    color: COLORS.black,
    fontFamily: FONTS.survey_font_bold,
    marginBottom: 16,
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    fontSize: 16,
  },
  caption: {
    color: COLORS.black,
    opacity: 0.8,
    marginBottom: 6,
    fontFamily: FONTS.main_font,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    marginRight: 10,
  },
  toggleActive: {
    backgroundColor: COLORS.light_blue4,
    borderColor: COLORS.light_blue4,
  },
  toggleText: {
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
  toggleTextActive: {
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.black,
    fontFamily: FONTS.main_font,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 6,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.black,
    fontFamily: FONTS.main_font,
    fontSize: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
})

export default CampaignCreate


