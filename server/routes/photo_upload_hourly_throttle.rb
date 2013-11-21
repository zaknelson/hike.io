require "rack/throttle"

class PhotoUploadHourlyThrottle < Rack::Throttle::Hourly
	def allowed?(request)
		if request.post? && /\/.*\/photos/.match(request.path)
			super
		else
			true
		end
	end
end