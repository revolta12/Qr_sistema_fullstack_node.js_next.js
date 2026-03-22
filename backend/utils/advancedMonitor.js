const axios = require('axios');
const geoip = require('geoip-lite');

class AdvancedMonitor {
    // Get detailed IP information
    async getIPDetails(ip) {
        try {
            const cleanIP = ip.replace('::ffff:', '');
            const geo = geoip.lookup(cleanIP);
            const ipInfo = await this.getIPInfo(cleanIP);
            return {
                ip: cleanIP,
                location: geo ? {
                    country: geo.country,
                    city: geo.city,
                    region: geo.region,
                    timezone: geo.timezone,
                    coordinates: [geo.ll[0], geo.ll[1]]
                } : null,
                isp: ipInfo?.isp || 'Unknown',
                asn: ipInfo?.org || 'Unknown',
                mobile: ipInfo?.mobile || false,
                proxy: ipInfo?.proxy || false
            };
        } catch (error) {
            return { ip: ip, error: 'Failed to get IP details' };
        }
    }
    getDeviceDetails(userAgent) {
        const ua = userAgent || '';
        
        return {
            browser: this.getBrowser(ua),
            os: this.getOS(ua),
            device: this.getDeviceType(ua),
            platform: this.getPlatform(ua),
            isMobile: ua.includes('Mobile'),
            raw: ua
        };
    }

    getBrowser(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    getOS(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone')) return 'iOS';
        return 'Unknown';
    }

    getDeviceType(ua) {
        if (ua.includes('Mobile')) return 'Mobile';
        if (ua.includes('Tablet')) return 'Tablet';
        return 'Desktop';
    }

    getPlatform(ua) {
        if (ua.includes('Win64')) return 'Windows 64-bit';
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Macintosh')) return 'Mac';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone')) return 'iPhone';
        return 'Unknown';
    }

    // Generate Google Maps link
    getMapsLink(coordinates) {
        if (!coordinates) return null;
        return `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`;
    }

    // Generate whois link
    getWhoisLink(ip) {
        return `https://whois.domaintools.com/${ip}`;
    }

    // Get external IP info
    async getIPInfo(ip) {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            return response.data;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new AdvancedMonitor();