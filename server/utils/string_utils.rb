class StringUtils
	# TODO, better way to do this?
	def self.is_integer?(str)
		true if Integer(str) rescue false
	end
	def self.is_numeric?(str)
		true if Float(str) rescue false
	end
end