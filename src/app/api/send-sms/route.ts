import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { phone, message } = await request.json();

        if (!phone || !message) {
            return NextResponse.json(
                { error: 'Phone and message are required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.NEXT_FAST2SMS_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'SMS API not configured' },
                { status: 500 }
            );
        }

        // Clean phone number - remove any non-digit characters and country code
        let cleanPhone = phone.replace(/\D/g, '');
        // Remove +91 or 91 prefix if present
        if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
            cleanPhone = cleanPhone.slice(-10);
        }

        // Fast2SMS Quick SMS API using GET method (more reliable)
        // Build URL with query parameters
        const params = new URLSearchParams({
            authorization: apiKey,
            route: 'q',
            message: message,
            language: 'english',
            flash: '0',
            numbers: cleanPhone,
        });

        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${params.toString()}`, {
            method: 'GET',
        });

        const data = await response.json();

        console.log('Fast2SMS Response:', data);

        if (data.return === true) {
            return NextResponse.json({ success: true, data });
        } else {
            return NextResponse.json(
                { error: data.message || 'Failed to send SMS' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('SMS Error:', error);
        return NextResponse.json(
            { error: 'Failed to send SMS' },
            { status: 500 }
        );
    }
}
