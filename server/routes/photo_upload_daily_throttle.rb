require "rack/throttle"

class PhotoUploadDailyThrottle < Rack::Throttle::Daily
	def allowed?(request)
		if request.post? && /\/.*\/photos/.match(request.path)
			super
		else
			true
		end
	end
end