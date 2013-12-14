class Cache
	@@cache = {}

	def self.set key, value
		@@cache[key] = value
	end

	def self.get key
		@@cache[key]
	end
end